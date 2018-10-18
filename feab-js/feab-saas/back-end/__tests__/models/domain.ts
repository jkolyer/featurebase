import Domain from '../../server/models/Domain';
import Team from '../../server/models/Team';
import User from '../../server/models/User';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import { generateNumberSlug, generateSlug } from '../../server/utils/slugify';

let owner = function() {
  let userId;
  return async function() {
    if (userId) return await User.findById(userId);

    const email = 'foo+bar@example.com';
    let usr = await User.findOne({ email });
    if (usr) {
      userId = usr.id;
      return usr;
    }

    const dName = 'Jim McBob';
    const slug = await generateSlug(User, dName);
    usr = await User.create({
      createdAt: new Date(),
      googleId: 'userGoogleId-abc123',
      email: email,
      googleToken: 'userGoogleToken',
      name: dName,
      avatarUrl: 'http://avatarUrl.com',
      slug,
      defaultTeamSlug: '',
    });
    userId = usr.id;
    return usr;
  }
}();

let ownerTeam = function() {
  return async function(downer) {
    let tm = await Team.findOne({ teamLeaderId: downer.id });
    if (tm) {
      return tm;
    }

    const defaultTeam = true;
    const slug = await generateNumberSlug(Team);
    const userId = downer.id;
    
    const team = await Team.create({
      teamLeaderId: userId,
      name: 'Team Name',
      slug,
      avatarUrl: 'http://avatarUrl.com',
      memberIds: [userId],
      createdAt: new Date(),
      defaultTeam,
    });
    return team;
  }
}();
  
describe('domain field validation', () => {

  beforeAll(async function() {
    await mongoose.connect(process.env.MONGO_URL_TEST);
    await Domain.remove({});
  });
  
  test('should be valid', async (done) => {
    const downer = await owner();
    debugger
    const dteam = await ownerTeam(downer);

    const dname = 'Site';
    const domain = await Domain.add({ userId: downer.id,
                                      name: dname,
                                      teamId: dteam.id });
    expect(domain.slug).toEqual('site');
    domain.validate((err) => {
      expect(err).toBeNull();
      done();
    });
  });
  
});
