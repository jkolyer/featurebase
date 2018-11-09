import * as mongoose from 'mongoose';

import logger from '../logs';
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
    slug,
  }: {
    userId: string;
    teamId: string;
    slug: string;
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
    domainId,
    name,
  }: {
    userId: string;
    domainId: string;
    name: string;
  }): Promise<IDomainDocument>;

  delete({
    userId,
    domainId,
  }: {
    userId: string;
    domainId: string;
  }): Promise<IDomainDocument>;
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

  public static async deriveTeamId(userId) {
      const teams = await Team.find({ teamLeaderId: userId },
                                    null,
                                    { sort: { name: 1 }}).lean();
      if (teams.length > 0) {
        return teams[0]._id;
      } else {
        throw {
          name: 'DomainLookup',
          message: 'missing team identifier',
        };
      }
  }

  public static async getList({ userId, teamId, slug }) {
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw {
          name: '',
          message: '',
        };
    }
    if (!teamId) {
      teamId = await this.deriveTeamId(userId);
    }

    const filter: any = { teamId };
    if (slug) {
      filter.slug = slug;
    }
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

    if (!teamId) {
      teamId = await this.deriveTeamId(userId);
    }
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

  public static async edit({ userId, domainId, name }) {
    if (!domainId) {
      throw {
        name: 'DomainEditError',
        message: 'Missing domain identifier',
      };
    }

    logger.debug(`*** Domain.edit:  ${userId}; ${domainId}; ${name}`);
    /*
    const domain = await this.findById(domainId)
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
    */
    const slug = await generateSlug(this, name);
    await this.updateOne(
      { _id: domainId },
      {
        name,
        slug,
      },
    );
    const domain = await this.findById(domainId);
    return { domain };
  }

  public static async delete({ userId, domainId }) {
    if (!domainId) {
      throw {
        name: 'DomainDeleteError',
        message: 'missing domain identifier',
      };
    }
    logger.debug(`*** Domain.delete:  ${userId}; ${domainId}`);

    const domain = await this.findById(domainId);
    // await this.checkPermission({ userId, teamId: domain.teamId });

    await this.deleteOne({ _id: domainId });
    return { domain };
  }

  public static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).lean();
  }
}

mongoSchema.loadClass(DomainClass);

const Domain = mongoose.model<IDomainDocument, IDomainModel>('Domain', mongoSchema);

export { Domain, IDomainDocument };
