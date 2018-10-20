import * as mongoose from 'mongoose';
import * as semver from 'semver';
import { IDomainDocument } from './Domain';
import { IDomainRoleDocument } from './DomainRole';
// import { logger } from '../utils/logs';

import { DEFAULT_STATE } from '../utils/FeatureFSM';
import { generateSlug } from '../utils/slugify';

const mongoSchema = new mongoose.Schema({
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
  domainRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DomainRole',
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
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
  state: {
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
  domain: IDomainDocument;
  domainRole: IDomainRoleDocument;
  parent: IFeatureDocument;
  name: string;
  slug: string;
  feabSemver: string;
  state: string;
  createdAt: Date;
}

interface IFeatureModel extends mongoose.Model<IFeatureDocument> {
  getList({
    domain,
    domainRole,
  }: {
    domain: IDomainDocument;
    domainRole: IDomainRoleDocument;
  }): Promise<{ features: IFeatureDocument[] }>;

  add({
    name,
    domain,
    domainRole,
    parent,
    feabSemver,
  }: {
    name: string;
    domain: IDomainDocument;
    domainRole: IDomainRoleDocument;
    parent: IFeatureDocument;
    feabSemver: string;
  }): Promise<IFeatureDocument>;

  delete({
    feature,
  }: {
    feature: IFeatureDocument;
  }): Promise<{ featureId: string }>;

  findChildren({
    feature,
  }: {
    feature: IFeatureDocument;
  }): Promise<IFeatureDocument[]>;

  bumpVersion({
    feature,
    part,
    parent,
  }: {
    feature: IFeatureDocument;
    part: string;
    parent: IFeatureDocument;
  }): Promise<IFeatureDocument>;

  addChildFeature({
    name,
    parentFeature,
  }: {
    name: string;
    parentFeature: IFeatureDocument;
  }): Promise<IFeatureDocument>;

}

class FeatureClass extends mongoose.Model {

  public static async getList({ domainRole }) {
    const filter: any = { domainRole };

    const features: any[] = await this.find(filter,
                                           null,
                                           { sort: { createdAt: 1 }}).lean();
    return { features };
  }

  public static async add({ name, domain, domainRole, parent, feabSemver }) {
    if (!name) {
      throw {
        name: 'FeatureAddError',
        message: 'Missing name',
      };
    }
    // await this.checkPermission({ domainId, parentId });

    const existing = await this.findOne({ domain,
                                          domainRole,
                                          name,
                                          parent,
                                          feabSemver,
                                        });
    if (existing) {
      throw {
        name: 'DuplicateFeatureName',
        message: `feature with name ${name} already exists`,
      };
    }
    const state = parent ? parent.state : DEFAULT_STATE;
    const slug = await generateSlug(this, name);
    return this.create({
      domain,
      domainRole,
      parent,
      feabSemver,
      name,
      slug,
      state,
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

    const childFeatures = await this.findChildren({ feature });
    for (const child of childFeatures) {
      await Feature.delete({ feature: child });
    }
    await this.deleteOne({ _id: feature.id });

    return { feature };
  }

  public static findBySlug(domainRole: IDomainRoleDocument, slug: string) {
    return this.findOne({ domainRole, slug }).lean();
  }

  public static async findChildren({ feature }) {
    const filter: any = { parent: feature };
    const features: any[] = await this.find(filter,
                                            null,
                                            { sort: { createdAt: 1 }});
    return features;
  }

  public static async bumpVersion({ feature, part, parent }) {
    const newVersion = semver.inc(feature.feabSemver, part);

    const clone = await Feature.add({ name: feature.name,
                                      domain: feature.domain,
                                      domainRole: feature.domainRole,
                                      parent,
                                      feabSemver: newVersion });

    const childFeatures = await this.findChildren({ feature });
    for (const child of childFeatures) {
      await Feature.bumpVersion({ feature: child,
                                  part,
                                  parent: clone });
    }
    return clone;
  }

  public static async addChildFeature({ name, parentFeature }) {
    const feature = await this.add({ name,
                                     domain: parentFeature.domain,
                                     domainRole: parentFeature.domainRole,
                                     parent: parentFeature,
                                     feabSemver: parentFeature.feabSemver,
                                   });
    return feature;
  }

}

mongoSchema.loadClass(FeatureClass);

const Feature = mongoose.model<IFeatureDocument, IFeatureModel>('Feature', mongoSchema);

export { Feature, IFeatureDocument };
