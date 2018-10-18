import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';
import Team from './Team';

const mongoSchema = new mongoose.Schema({
  createdUserId: {
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
  createdUserId: string;
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
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('teamLeaderId')
      .lean();

    if (!team) {
      throw new Error('Team not found');
    }

    return { team };
  }

  public static async getList({ userId, teamId }) {
    await this.checkPermission({ userId, teamId });

    const filter: any = { teamId };

    const domains: any[] = await this.find(filter,
                                           null,
                                           { sort: { createdAt: 1 }}).lean();

    return { domains };
  }

  public static async add({ name, userId, teamId }) {
    if (!name) {
      throw new Error('Bad data');
    }

    await this.checkPermission({ userId, teamId });

    const slug = await generateSlug(this, name);

    return this.create({
      createdUserId: userId,
      teamId,
      name,
      slug,
      createdAt: new Date(),
    });
  }

  public static async edit({ userId, id, name }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const domain = await this.findById(id)
      .select('teamId createdUserId')
      .lean();

    const { team } = await this.checkPermission({
      userId,
      teamId: domain.teamId,
    });

    if (domain.createdUserId !== userId && team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only create user or team leader can update.');
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
      throw new Error('Bad data');
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

export default Domain;
