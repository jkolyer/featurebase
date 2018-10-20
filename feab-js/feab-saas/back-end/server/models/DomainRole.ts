import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { IDomainDocument } from './Domain';

import { generateSlug } from '../utils/slugify';

const mongoSchema = new mongoose.Schema({
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
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
});

mongoSchema.index({ name: 'text' });

interface IDomainRoleDocument extends mongoose.Document {
  domain: IDomainDocument;
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
    domain,
    parentId,
  }: {
    name: string;
    domain: IDomainDocument;
    parentId: string;
  }): Promise<IDomainRoleDocument>;

  delete({
    domainRole,
  }: {
    domainRole: IDomainRoleDocument;
  }): Promise<{ parentId: string }>;

  findParent({
    parentId,
  }: {
    parentId: string;
  }): Promise<IDomainRoleDocument>;

  findChildren({
    domainRoleId,
  }: {
    domainRoleId: string;
  }): Promise<IDomainRoleDocument[]>;

}

class DomainRoleClass extends mongoose.Model {
  public static async checkPermission({ domainId, parentId }) {
    if (!domainId) {
      throw {
        name: 'DomainRoleCheckPermission',
        message: 'Missing domainId',
      };
    }
    if (parentId) {
      const parent = await this.findById(parentId).lean();
      if (!parent) {
        throw {
          name: 'DomainRoleCheckPermission',
          message: `Parent not found with id ${parentId}`,
        };
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

  public static async add({ name, domain, parentId }) {
    if (!name) {
      throw {
        name: 'DomainRoleAddError',
        message: 'Missing name',
      };
    }
    // await this.checkPermission({ domainId, parentId });

    const existing = await this.findOne({ domain, name });
    if (existing) {
      throw {
        name: 'DuplicateDomainRoleName',
        message: `domain role with name ${name} already exists`,
      };
    }
    const slug = await generateSlug(this, name);

    return this.create({
      domain,
      parentId,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async delete({ domainRole }) {
    if (!domainRole) {
      throw {
        name: 'DomainRoleDelete',
        message: 'Missing identifier',
      };
    }
    const roleParentId = domainRole.parentId;

    // update parentId of all children
    const filter: any = { parentId: domainRole.id };
    const domainRoles: any[] = await this.find(filter);

    _.forEach(domainRoles, async dRole => {
      await this.updateOne(
        { _id: dRole.id },
        { parentId: roleParentId },
      );
    });

    await this.deleteOne({ _id: domainRole.id });

    return { parentId: roleParentId };
  }

  public static findBySlug(domainId: string, slug: string) {
    return this.findOne({ domainId, slug }).lean();
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

mongoSchema.loadClass(DomainRoleClass);

const DomainRole = mongoose.model<IDomainRoleDocument, IDomainRoleModel>('DomainRole', mongoSchema);

export { DomainRole, IDomainRoleDocument };
