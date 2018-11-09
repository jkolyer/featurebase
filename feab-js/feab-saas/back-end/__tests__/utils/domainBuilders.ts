import * as mongoose from 'mongoose';
import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import Team from '../../server/models/Team';
import User from '../../server/models/User';
import { generateNumberSlug, generateSlug } from '../../server/utils/slugify';

const owner = async (email: string = null) => {
  if (!email) {
    email = 'foo+bar@example.com';
  }

  let usr = await User.findOne({ email });
  if (usr) {
    return usr;
  }
  const dName = 'Jim McBob';
  const slug = await generateSlug(User, dName);
  usr = await User.create({
    createdAt: new Date(),
    googleId: 'userGoogleId-abc123',
    email,
    googleToken: 'userGoogleToken',
    name: dName,
    avatarUrl: 'http://avatarUrl.com',
    slug,
    defaultTeamSlug: '',
  });
  return usr;
};

const ownerTeam = async domainOwner => {
  let tm = await Team.findOne({ teamLeaderId: domainOwner._id });
  if (tm) {
    return tm;
  }

  const defaultTeam = true;
  const slug = await generateNumberSlug(Team);
  const userId = domainOwner._id;

  tm = await Team.create({
    teamLeaderId: userId,
    name: 'Team Name',
    slug,
    avatarUrl: 'http://avatarUrl.com',
    memberIds: [userId],
    createdAt: new Date(),
    defaultTeam,
  });
  return tm;
};

const buildDomain = async (dname: string, email: string = null) => {
  const domainOwner = await owner(email);
  const domainTeam = await ownerTeam(domainOwner);

  const domain = await Domain.add({ userId: domainOwner._id,
                                    name: dname,
                                    teamId: domainTeam._id });
  return domain;
};

const buildDomainRole = async (name, domain, parent) => {
  const role = await DomainRole.add({ domain,
                                      name,
                                      parent });
  return role;
};

const buildDomainAndRole = async (domainName: string, domainRoleName: string) => {
  const domain = await buildDomain(domainName);
  const domainRole = await buildDomainRole(domainRoleName, domain, null);
  return domainRole;
};

const loginCookie = (serverAgent, done) => {
  serverAgent
    .get('/auth/google')
    .expect(302)
    .expect('Location', '/')
    .end((_, res) => {
      done(res.headers['set-cookie']);
    });
};

const flushDocuments = async () => {
    await User.remove({});
    await Team.remove({});
    await Domain.remove({});
    await DomainRole.remove({});
};

let mongoose_db = null;

const setupMongoose = async (isUp) => {
  if (isUp) {
    const mongo_options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
    };
    mongoose_db = await mongoose.connect(process.env.MONGO_URL_TEST, mongo_options);
    await flushDocuments();
    
  } else {
    if (mongoose_db) {
      await flushDocuments();
      await mongoose_db.close()
      mongoose_db = null;
    }
  }
};

export {
  buildDomain,
  buildDomainRole,
  buildDomainAndRole,
  flushDocuments,
  loginCookie,
  owner,
  ownerTeam,
  setupMongoose,
};
