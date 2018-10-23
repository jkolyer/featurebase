import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';
import Team from './Team';
import User from './User';

const mongoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  teamId: {
    type: String,
    required: true,
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

interface IDomainDocument extends mongoose.Document {
  userId: string;
  teamId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface IDomainModel extends mongoose.Model<IDomainDocument> {
  getList({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<{ domains: IDomainDocument[] }>;

  add({
    name,
    userId,
    teamId,
  }: {
    name: string;
    userId: string;
    teamId: string;
  }): Promise<IDomainDocument>;

  edit({
    userId,
    id,
    name,
  }: {
    userId: string;
    id: string;
    name: string;
  }): Promise<{ teamId: string }>;

  delete({ userId, id }: { userId: string; id: string }): Promise<{ teamId: string }>;
}

class DomainClass extends mongoose.Model {
  public static async checkPermission({ userId, teamId }) {
    if (!userId || !teamId) {
      throw {
        name: 'DomainPermissions',
        message: 'Missing user or team identifier',
      };
    }

    const team = await Team.findById(teamId)
      .select('teamLeaderId')
      .lean();

    if (!team) {
      throw {
        name: 'DomainPermissions',
        message: 'Missing team',
      };
    }

    return { team };
  }

  public static async getList({ userId, teamId }) {
    // await this.checkPermission({ userId, teamId });

    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw {
          name: '',
          message: '',
        };
    }
    if (!teamId) {

      const teams = await Team.find({ teamLeaderId: userId },
                                    null,
                                    { sort: { name: 1 }}).lean();
      if (teams.length > 0) {
        teamId = teams[0].id;
      } else {
        throw {
          name: '',
          message: '',
        };
      }
    }

    const filter: any = { teamId };
    const domains: any[] = await this.find(filter,
                                           null,
                                           { sort: { name: 1 }}).lean();

    return { domains };
  }

  public static async add({ name, userId, teamId }) {
    if (!name) {
      throw {
        name: 'DomainAddError',
        message: 'Missing name',
      };
    }

    await this.checkPermission({ userId, teamId });

    const existing = await this.findOne({ userId, teamId, name });
    if (existing) {
      throw {
        name: 'DuplicateDomainName',
        message: `domain with name '${name}' already exists`,
      };
    }

    const slug = await generateSlug(this, name);

    return this.create({
      userId,
      teamId,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async edit({ userId, id, name }) {
    if (!id) {
      throw {
        name: 'DomainEditError',
        message: 'Missing domain identifier',
      };
    }

    const domain = await this.findById(id)
      .select('teamId userId')
      .lean();

    const { team } = await this.checkPermission({
      userId,
      teamId: domain.teamId,
    });

    if (domain.userId !== userId && team.teamLeaderId !== userId) {
      throw {
        name: 'DomainEditError',
        message: 'Permission denied. Only create user or team leader can update.',
      };
    }

    await this.updateOne(
      { _id: id },
      {
        name,
      },
    );

    return { teamId: domain.teamId };
  }

  public static async delete({ userId, id }) {
    if (!id) {
      throw {
        name: 'DomainDeleteError',
        message: 'missing domain identifier',
      };
    }

    const domain = await this.findById(id)
      .select('teamId')
      .lean();

    await this.checkPermission({ userId, teamId: domain.teamId });

    await this.deleteOne({ _id: id });

    return { teamId: domain.teamId };
  }

  public static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).lean();
  }
}

mongoSchema.loadClass(DomainClass);

const Domain = mongoose.model<IDomainDocument, IDomainModel>('Domain', mongoSchema);

export { Domain, IDomainDocument };
