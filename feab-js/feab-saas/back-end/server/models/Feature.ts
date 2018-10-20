import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import * as semver from 'semver';

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
    validate: {
      validator: val => {
        return !!semver.valid(val);
      },
      message: props => `${props.value} is not a valid semver`,
    },
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
  feabSemver: string;
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

  delete({
    feature,
  }: {
    feature: IFeatureDocument,
  }): Promise<{ featureId: string }>;
}

class FeatureClass extends mongoose.Model {

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
    // await this.checkPermission({ domainId, parentId });

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

  // public static async delete({ domainId, id }) {
  public static async delete({ feature }) {
    if (!feature) {
      throw {
        name: 'FeatureDeleteError',
        message: 'missing feature identifier',
      };
    }
    // await this.checkPermission({ domainId, domainRoleId: null });

    // update parentId of all children
    const filter: any = { parentId: feature.id };
    const features: any[] = await this.find(filter);

    _.forEach(features, async child => {
      await this.updateOne(
        { _id: child.id },
        { parentId: feature.parentId },
      );
    });

    await this.deleteOne({ _id: feature.id });

    return { featureId: feature.id };
  }

  public static findBySlug(domainRoleId: string, slug: string) {
    return this.findOne({ domainRoleId, slug }).lean();
  }

  public static async findParent({ parentId }) {
    await this.findOne({ _id: parentId });
  }

  public static async findChildren({ featureId }) {
    const filter: any = { parentId: featureId };
    const features: any[] = await this.find(filter,
                                            null,
                                            { sort: { createdAt: 1 }});
    return features;
  }

}

mongoSchema.loadClass(FeatureClass);

const Feature = mongoose.model<IFeatureDocument, IFeatureModel>('Feature', mongoSchema);

export { Feature, IFeatureDocument };
