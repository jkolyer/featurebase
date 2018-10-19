import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';

const mongoSchema = new mongoose.Schema({
  domainId: {
    type: String,
    required: true,
  },
  domainRoleId: {
    type: String,
    required: true,
  },
  parentId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  feabSemver: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

mongoSchema.index({ name: 'text' });

interface IFeatureDocument extends mongoose.Document {
  domainId: string;
  domainRoleId: string;
  parentId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface IFeatureModel extends mongoose.Model<IFeatureDocument> {
  getList({
    domainId,
    domainRoleId,
  }: {
    domainId: string;
    domainRoleId: string;
  }): Promise<{ features: IFeatureDocument[] }>;

  add({
    name,
    domainId,
    domainRoleId,
    parentId,
    feabSemver,
  }: {
    name: string;
    domainId: string;
    domainRoleId: string;
    parentId: string;
    feabSemver: string;
  }): Promise<IFeatureDocument>;

  edit({
    domainId,
    id,
    name,
  }: {
    domainId: string;
    id: string;
    name: string;
  }): Promise<{ domainRoleId: string }>;

  delete({ domainId, id }: { domainId: string; id: string }): Promise<{ domainRoleId: string }>;
}

class FeatureClass extends mongoose.Model {
  public static async checkPermission({ domainId, parentId }) {
    if (!domainId) {
      throw {
        name: 'FeatureCheckPermission',
        message: 'Missing domainId',
      };
    }
    if (parentId) {
      const parent = await this.findById(parentId).lean();
      if (!parent) {
        throw {
          name: 'FeatureCheckPermission',
          message: `Parent not found with id ${parentId}`,
        };
      }
    }
  }

  public static async getList({ domainRoleId }) {
    // await this.checkPermission({ domainId, parentId: null });

    const filter: any = { domainRoleId };

    const features: any[] = await this.find(filter,
                                           null,
                                           { sort: { createdAt: 1 }}).lean();

    return { features };
  }

  public static async add({ name, domainId, domainRoleId, parentId, feabSemver }) {
    if (!name) {
      throw {
        name: 'FeatureAddError',
        message: 'Missing name',
      };
    }
    await this.checkPermission({ domainId, parentId });

    const existing = await this.findOne({ domainId,
                                          domainRoleId,
                                          name,
                                          parentId,
                                          feabSemver,
                                        });
    if (existing) {
      throw {
        name: 'DuplicateFeatureName',
        message: `feature with name ${name} already exists`,
      };
    }

    const slug = await generateSlug(this, name);
    return this.create({
      domainId,
      domainRoleId,
      parentId,
      feabSemver,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async edit({ domainId, id, name }) {
    if (!id) {
      throw {
        name: 'FeatureEditError',
        message: 'Missing feature identifier',
      };
    }

    const feature = await this.findById(id)
      .select('domainRoleId domainId')
      .lean();

    /*
    const { team } = await this.checkPermission({
      domainId,
      domainRoleId: feature.domainRoleId,
    });
    */

    if (feature.domainId !== domainId) {
      throw {
        name: 'FeatureEditError',
        message: 'Permission denied. Only creating user.',
      };
    }
    await this.updateOne(
      { _id: id },
      { name },
    );
    return { domainRoleId: feature.domainRoleId };
  }

  // public static async delete({ domainId, id }) {
  public static async delete({ id }) {
    if (!id) {
      throw {
        name: 'FeatureDeleteError',
        message: 'missing feature identifier',
      };
    }
    const feature = await this.findById(id)
      .select('domainRoleId')
      .lean();

    if (!feature) {
      throw {
        name: 'FeatureDeleteError',
        message: 'missing feature',
      };
    }
    // await this.checkPermission({ domainId, domainRoleId: null });

    // update parentId of all children
    const filter: any = { parentId: id };
    const features: any[] = await this.find(filter);

    _.forEach(features, async child => {
      await this.updateOne(
        { _id: child.id },
        { parentId: feature.parentId },
      );
    });

    await this.deleteOne({ _id: id });

    return { domainRoleId: feature.domainRoleId };
  }

  public static findBySlug(domainRoleId: string, slug: string) {
    return this.findOne({ domainRoleId, slug }).lean();
  }

  public static async findParent({ parentId }) {
    await this.findOne({ _id: parentId });
  }

  public static async findChildren({ domainRoleId }) {
    const filter: any = { parentId: domainRoleId };
    const domainRoles: any[] = await this.find(filter,
                                               null,
                                               { sort: { createdAt: 1 }});
    return domainRoles;
  }

}

mongoSchema.loadClass(FeatureClass);

const Feature = mongoose.model<IFeatureDocument, IFeatureModel>('Feature', mongoSchema);

export default Feature;
