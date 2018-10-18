import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';
// import Team from './Team';

const mongoSchema = new mongoose.Schema({
  domainId: {
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
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

mongoSchema.index({ name: 'text' });

interface IDomainRoleDocument extends mongoose.Document {
  domainId: string;
  parentId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface IDomainRoleModel extends mongoose.Model<IDomainRoleDocument> {
  getList({
    domainId,
  }: {
    domainId: string;
  }): Promise<{ domainRoles: IDomainRoleDocument[] }>;

  add({
    name,
    domainId,
    parentId,
  }: {
    name: string;
    domainId: string;
    parentId: string;
  }): Promise<IDomainRoleDocument>;

  edit({
    domainId,
    id,
    name,
  }: {
    domainId: string;
    id: string;
    name: string;
  }): Promise<{ parentId: string }>;

  delete({
    domainId,
    id,
  }: {
    domainId: string;
    id: string;
  }): Promise<{ parentId: string }>;
}

class DomainRoleClass extends mongoose.Model {
  public static async checkPermission({ domainId, parentId }) {
    if (!domainId) {
      throw new Error('DomainRole.checkPermission:  Missing domainId');
    }
    if (parentId) {
      const parent = await this.findById(parentId).lean();
      if (!parent) {
        throw new Error('DomainRole.checkPermission:  Parent not found');
      }
    }
  }

  public static async getList({ domainId, parentId }) {
    await this.checkPermission({ domainId, parentId });

    const filter: any = { domainId };

    const domainRoles: any[] = await this.find(filter,
                                               null,
                                               { sort: { createdAt: 1 }}).lean();

    return { domainRoles };
  }

  public static async add({ name, domainId, parentId }) {
    if (!name) {
      throw new Error('Add: Missing name');
    }

    await this.checkPermission({ domainId, parentId });

    const slug = await generateSlug(this, name);

    return this.create({
      domainId,
      parentId,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async delete({ domainId, id }) {
    if (!id) {
      throw new Error('DomainRole.delete: Missing id');
    }

    const domainRole = await this.findById(id)
      .select('parentId')
      .lean();

    await this.checkPermission({ domainId, parentId: domainRole.parentId });

    // update parentId of all children
    const filter: any = { parentId: id };
    const domainRoles: any[] = await this.find(filter);

    _.forEach(domainRoles, async dRole => {
      await this.updateOne(
        { _id: dRole.id },
        { parentId: domainRole.parentId },
      );
    });

    await this.deleteOne({ _id: id });

    return { parentId: domainRole.parentId };
  }

  public static findBySlug(parentId: string, slug: string) {
    return this.findOne({ parentId, slug }).lean();
  }
}

mongoSchema.loadClass(DomainRoleClass);

const DomainRole = mongoose.model<IDomainRoleDocument, IDomainRoleModel>('DomainRole', mongoSchema);

export default DomainRole;
