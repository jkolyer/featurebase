import * as mongoose from 'mongoose';
import { IDomainDocument } from './Domain';

import { generateSlug } from '../utils/slugify';

const mongoSchema = new mongoose.Schema({
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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DomainRole',
    required: false,
  },
});

mongoSchema.index({ name: 'text' });

interface IDomainRoleDocument extends mongoose.Document {
  domain: IDomainDocument;
  parent: IDomainRoleDocument;
  name: string;
  slug: string;
  createdAt: Date;
}

interface IDomainRoleModel extends mongoose.Model<IDomainRoleDocument> {
  getList({
    domain,
  }: {
    domain: IDomainDocument;
  }): Promise<IDomainRoleDocument[]>;

  getRole({
    domain,
    roleId,
  }: {
    domain: IDomainDocument;
    roleId: string;
  }): Promise<IDomainRoleDocument>;

  add({
    name,
    domain,
    parent,
  }: {
    name: string;
    domain: IDomainDocument;
    parent: IDomainRoleDocument;
  }): Promise<IDomainRoleDocument>;

  edit({
    roleId,
    name,
    parent,
  }: {
    roleId: string;
    name: string;
    parent: IDomainRoleDocument;
  }): Promise<IDomainRoleDocument>;

  delete({
    roleId,
  }: {
    roleId: string;
  }): Promise<IDomainRoleDocument>;

  findChildren({
    domainRole,
  }: {
    domainRole: IDomainRoleDocument;
  }): Promise<IDomainRoleDocument[]>;

  findBySlug({
    slug,
  }: {
    slug: string;
  }): Promise<IDomainRoleDocument>;

}

class DomainRoleClass extends mongoose.Model {

  public static async getRole({ domain, roleId }) {
    const filter: any = { domain, _id: roleId };
    const role: any = await this.findOne(filter).lean();
    return role;
  }

  public static async getList({ domain }) {
    const filter: any = { domain };
    const roles: any[] = await this.find(filter,
                                         null,
                                         { sort: { name: 1 }}).lean();
    return roles;
  }

  public static async add({ name, domain, parent }) {
    if (!name) {
      throw {
        name: 'DomainRoleAddError',
        message: 'Missing name',
      };
    }

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
      parent,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async edit({ roleId, name, parent }) {
    if (!roleId) {
      throw {
        name: 'DomainRoleEditError',
        message: 'Missing role identifier',
      };
    }

    const slug = await generateSlug(this, name);
    await this.updateOne(
      { _id: roleId },
      {
        name,
        slug,
        parent,
      },
    );
    const role = await this.findById(roleId);
    return role;
  }

  public static async delete({ roleId }) {
    if (!roleId) {
      throw {
        name: 'DomainRoleDeleteError',
        message: 'Missing identifier',
      };
    }
    const role = await this.findOne({ _id: roleId });
    if (!role) {
      throw {
        name: 'DomainRoleDeleteError',
        message: 'unknown role',
      };
    }
    const roleParentId = role.parent;
    const roleParent = await this.findOne({ _id: roleParentId });

    // update parent of all children
    const filter: any = { parent: role };
    const domainRoles: any[] = await this.find(filter);

    for (const dRole of domainRoles) {
      await this.updateOne(
        { _id: dRole.id },
        { parent: roleParent },
      );
    }
    await this.deleteOne({ _id: roleId });
    return { roleId };
  }

  public static async findBySlug({ slug }) {
    return await this.findOne({ slug }).lean();
  }

  public static async findChildren({ domainRole }) {
    const filter: any = { parent: domainRole };
    const domainRoles: any[] = await this.find(filter,
                                               null,
                                               { sort: { createdAt: 1 }});
    return domainRoles;
  }

}

mongoSchema.loadClass(DomainRoleClass);

const DomainRole = mongoose.model<IDomainRoleDocument, IDomainRoleModel>('DomainRole', mongoSchema);

export { DomainRole, IDomainRoleDocument };
