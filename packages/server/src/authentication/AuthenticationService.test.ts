/**
 * Copyright © 2023 Rémi Pace.
 * This file is part of Abc-Map.
 *
 * Abc-Map is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * Abc-Map is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General
 * Public License along with Abc-Map. If not, see <https://www.gnu.org/licenses/>.
 */

import * as uuid from 'uuid-random';
import * as jwt from 'jsonwebtoken';
import { assert } from 'chai';
import { TestHelper } from '../utils/TestHelper';
import { MongodbClient } from '../mongodb/MongodbClient';
import { ConfigLoader } from '../config/ConfigLoader';
import { AuthenticationService, logger } from './AuthenticationService';
import { UserService } from '../users/UserService';
import { Config } from '../config/Config';
import {
  AbcUser,
  AnonymousUser,
  AuthenticationStatus,
  AuthenticationToken,
  ConfirmationStatus,
  Language,
  RegistrationStatus,
  RegistrationToken,
  ResetPasswordToken,
  UserStatus,
} from '@abc-map/shared';
import { PasswordHasher } from './PasswordHasher';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import jwtDecode from 'jwt-decode';
import { RegistrationDao } from './RegistrationDao';
import { EmailService } from '../email/EmailService';
import { RegistrationDocument } from './RegistrationDocument';

logger.disable();

describe('AuthenticationService', () => {
  let config: Config;
  let userService: UserService;
  let mongodbClient: MongodbClient;
  let hasher: PasswordHasher;
  let emails: SinonStubbedInstance<EmailService>;
  let registrations: RegistrationDao;
  let service: AuthenticationService;

  before(async () => {
    config = await ConfigLoader.load();
    // We disable development option because we mock smtp client
    config.development = undefined;
    mongodbClient = await MongodbClient.createAndConnect(config);

    hasher = new PasswordHasher(config);
    emails = sinon.createStubInstance(EmailService);

    registrations = new RegistrationDao(mongodbClient);
    userService = UserService.create(config, mongodbClient);
    service = new AuthenticationService(config, registrations, userService, hasher, emails as unknown as EmailService);
    await userService.init();
    await service.init();
  });

  beforeEach(async () => {
    emails.confirmRegistration.reset();
    emails.confirmRegistration.resolves();

    emails.resetPassword.reset();
    emails.resetPassword.resolves();
  });

  after(async () => {
    return mongodbClient.disconnect();
  });

  describe('signAuthenticationToken()', () => {
    it('for authenticated user', async () => {
      // Prepare
      const user = TestHelper.sampleUser();

      // Act
      const token = service.signAuthenticationToken(user);

      // Assert
      assert.match(token, /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
      const decoded = jwtDecode<AuthenticationToken>(token);
      assert.equal(decoded.userStatus, UserStatus.Authenticated);
      assert.equal(decoded.user.id, user.id);
      assert.equal(decoded.user.password, '<password-was-erased>');
      assert.equal(decoded.user.email, user.email);
    });

    it('for anonymous user', async () => {
      // Act
      const token = service.signAuthenticationToken(AnonymousUser);

      // Assert
      assert.match(token, /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
      const decoded = jwtDecode<AuthenticationToken>(token);
      assert.equal(decoded.userStatus, UserStatus.Anonymous);
      assert.equal(decoded.user.id, AnonymousUser.id);
      assert.equal(decoded.user.password, '<password-was-erased>');
      assert.equal(decoded.user.email, AnonymousUser.email);
    });
  });

  describe('verifyAuthenticationToken()', () => {
    it('should return token content', async () => {
      const user = TestHelper.sampleUser();
      const token = service.signAuthenticationToken(user);

      const payload = (await service.verifyAuthenticationToken(token)) as AuthenticationToken;

      assert.deepEqual(payload.userStatus, UserStatus.Authenticated);
      assert.deepEqual(payload.user.id, user.id);
      assert.deepEqual(payload.user.email, user.email);
      assert.deepEqual(payload.user.password, '<password-was-erased>');
    });

    it('should return false if token contains wrong chars', async () => {
      const user = TestHelper.sampleUser();
      const token = service.signAuthenticationToken(user);

      const tokenContent = await service.verifyAuthenticationToken(`${token}-with-wrong-chars`);

      assert.isFalse(tokenContent);
    });

    it('should return false if token is signed with a wrong secret', async () => {
      const user = TestHelper.sampleUser();
      const token = jwt.sign(user, 'wrong-secret', {
        algorithm: config.jwt.algorithm,
        expiresIn: config.authentication.tokenExpiresIn,
      });

      const tokenContent = await service.verifyAuthenticationToken(token);

      assert.isFalse(tokenContent);
    });
  });

  it('signRegistrationToken()', async () => {
    // Act
    const token = service.signRegistrationToken('test-registration-id');

    // Assert
    assert.match(token, /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
    const decoded = jwtDecode<RegistrationToken>(token);
    assert.equal(decoded.registrationId, 'test-registration-id');
  });

  describe('verifyRegistrationToken()', () => {
    it('should return token content', async () => {
      const token = service.signRegistrationToken('test-registration-id');

      const payload = (await service.verifyRegistrationToken(token)) as RegistrationToken;

      assert.equal(payload.registrationId, 'test-registration-id');
    });

    it('should return false if token contains wrong chars', async () => {
      const token = service.signRegistrationToken('test-registration-id');

      const tokenContent = await service.verifyAuthenticationToken(`${token}-with-wrong-chars`);

      assert.isFalse(tokenContent);
    });

    it('should return false if token is signed with a wrong secret', async () => {
      const token = jwt.sign({ registrationId: 'test-registration-id' }, 'wrong-secret', {
        algorithm: config.jwt.algorithm,
        expiresIn: config.authentication.tokenExpiresIn,
      });

      const tokenContent = await service.verifyAuthenticationToken(token);

      assert.isFalse(tokenContent);
    });
  });

  it('signResetPasswordToken()', async () => {
    // Act
    const token = service.signResetPasswordToken('test@abc-map.fr');

    // Assert
    assert.match(token, /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
    const decoded = jwtDecode<ResetPasswordToken>(token);
    assert.equal(decoded.email, 'test@abc-map.fr');
  });

  describe('verifyResetPasswordToken()', () => {
    it('should return token content', async () => {
      const token = service.signResetPasswordToken('test@abc-map.fr');

      const payload = (await service.verifyResetPasswordToken(token)) as ResetPasswordToken;

      assert.equal(payload.email, 'test@abc-map.fr');
    });

    it('should return false if token contains wrong chars', async () => {
      const token = service.signResetPasswordToken('test@abc-map.fr');

      const tokenContent = await service.verifyResetPasswordToken(`${token}-with-wrong-chars`);

      assert.isFalse(tokenContent);
    });

    it('should return false if token is signed with a wrong secret', async () => {
      const token = jwt.sign({ email: 'test@abc-map.fr' }, 'wrong-secret', {
        algorithm: config.jwt.algorithm,
        expiresIn: config.authentication.tokenExpiresIn,
      });

      const tokenContent = await service.verifyResetPasswordToken(token);

      assert.isFalse(tokenContent);
    });
  });

  describe('register()', () => {
    it('should send mail with registration token', async () => {
      // Prepare
      const user = TestHelper.sampleUser();

      // Act
      const status = await service.register({ email: user.email, password: user.password, lang: Language.French });

      // Assert
      assert.equal(status, RegistrationStatus.Successful);
      assert.equal(emails.confirmRegistration.callCount, 1);
      assert.equal(emails.confirmRegistration.args[0][0], Language.French);
      assert.equal(emails.confirmRegistration.args[0][1], user.email);
      assert.match(emails.confirmRegistration.args[0][2], /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
    });

    it('should fail if mail already exists', async () => {
      // Prepare
      const user = TestHelper.sampleUser();
      await userService.save(user);

      // Act
      const status = await service.register({ email: user.email, password: 'azerty1234', lang: Language.French });

      // Assert
      assert.equal(status, RegistrationStatus.EmailAlreadyExists);
    });

    it('should fail if mail is reserved', async () => {
      // Act
      const status = await service.register({ email: AnonymousUser.email, password: 'azerty1234', lang: Language.French });

      // Assert
      assert.equal(status, RegistrationStatus.EmailAlreadyExists);
    });

    // While registration is not confirmed, users should be able to register several times in case of mail failure
    it('should register twice with same email', async () => {
      // Prepare
      const email = TestHelper.sampleUser().email;
      await service.register({ email, password: 'azerty1234', lang: Language.French });

      // Act
      const status = await service.register({ email, password: 'azerty1234', lang: Language.French });

      // Assert
      assert.equal(status, RegistrationStatus.Successful);
    });

    it('should trim password', async () => {
      // Prepare
      const email = TestHelper.sampleUser().email;

      // Act
      await service.register({ email, password: '       azerty1234     ', lang: Language.French });

      // Assert
      const token = await getRegistrationToken();
      const registration = (await registrations.findById(token.registrationId)) as RegistrationDocument;
      assert.equal(registration.password, await hasher.hashPassword('azerty1234', registration._id));
    });
  });

  describe('confirmRegistration()', () => {
    it('should create user', async () => {
      // Prepare
      const user = TestHelper.sampleUser();
      await service.register({ email: user.email, password: user.password, lang: Language.French });
      const token = await getRegistrationToken();

      // Act
      const registeredUser = (await service.confirmRegistration(token.registrationId)) as AbcUser;

      // Assert
      assert.isDefined(registeredUser.id);
      assert.equal(registeredUser.email, user.email);
      assert.equal(registeredUser.password, await hasher.hashPassword(user.password, registeredUser.id));
    });

    it('should not create user if registration not found', async () => {
      const error: Error = await service.confirmRegistration('non existing registration').catch((err) => err);

      assert.match(error.message, /Registration not found/);
    });

    it('should not create user if email already confirmed', async () => {
      // Prepare
      const user = TestHelper.sampleUser();
      await service.register({ email: user.email, password: user.password, lang: Language.French });
      await service.register({ email: user.email, password: user.password, lang: Language.French });
      const token1 = await getRegistrationToken();
      await service.confirmRegistration(token1.registrationId);

      const token2 = await getRegistrationToken(1);

      // Act
      const result = await service.confirmRegistration(token2.registrationId);

      // Assert
      assert.equal(result, ConfirmationStatus.AlreadyConfirmed);
    });
  });

  describe('authenticate()', () => {
    it('should return Refused status if user is unknown', async () => {
      const res = await service.authenticate(uuid(), uuid());

      assert.equal(res.status, AuthenticationStatus.Refused);
    });

    it('should return Refused status if password is wrong', async () => {
      const user = TestHelper.sampleUser();
      await userService.save(user);

      const res = await service.authenticate(user.email, uuid());

      assert.equal(res.status, AuthenticationStatus.Refused);
    });

    it('should return Successful status', async () => {
      // Prepare
      const password = 'azerty1234';
      const user = TestHelper.sampleUser();
      user.password = await hasher.hashPassword(password, user.id);
      await userService.save(user);

      // Act
      const res = await service.authenticate(user.email, password);

      // Assert
      assert.equal(res.status, AuthenticationStatus.Successful);
      assert.isDefined(res.user);
      assert.equal(res.user?.id, user.id);
      assert.equal(res.user?.email, user.email);
      assert.isDefined(res.user?.password);
      assert.equal(res.user?.password, '<password-was-erased>');
    });

    it('should return Successful status if user is anonymous', async () => {
      const res = await service.authenticate(AnonymousUser.email, AnonymousUser.password);

      assert.equal(res.status, AuthenticationStatus.Successful);
      assert.isDefined(res.user);
      assert.isDefined(res.user?.id);
      assert.equal(res.user?.email, AnonymousUser.email);
      assert.equal(res.user?.password, AnonymousUser.password);
    });

    it('should generate ids for anonymous users', async () => {
      const res1 = await service.authenticate(AnonymousUser.email, AnonymousUser.password);
      const res2 = await service.authenticate(AnonymousUser.email, AnonymousUser.password);

      assert.isDefined(res1.user?.id);
      assert.isDefined(res2.user?.id);
      assert.notEqual(res1.user?.id, res2.user?.id);
    });

    it('should trim passwords', async () => {
      const password = '     azerty1234      ';
      const user = TestHelper.sampleUser();
      user.password = await hasher.hashPassword(password.trim(), user.id);
      await userService.save(user);

      const res = await service.authenticate(user.email, password);

      assert.equal(res.status, AuthenticationStatus.Successful);
    });
  });

  describe('passwordLost()', () => {
    it('should do nothing if user is unknown', async () => {
      // Act
      await service.passwordLost('non-existing@abc-map.fr', Language.French);

      // Assert
      await TestHelper.wait(10); // Wait an internal promise
      assert.equal(emails.resetPassword.callCount, 0);
    });

    it('should send mail if user is known', async () => {
      const user = TestHelper.sampleUser();
      await userService.save(user);

      // Act
      await service.passwordLost(user.email, Language.French);

      // Assert
      await TestHelper.wait(10); // Wait an internal promise
      assert.equal(emails.resetPassword.callCount, 1);
      assert.equal(emails.resetPassword.args[0][0], Language.French);
      assert.equal(emails.resetPassword.args[0][1], user.email);
      assert.match(emails.resetPassword.args[0][2], /^eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9\./i);
    });
  });

  describe('updatePassword()', () => {
    it('should throw if user is unknown', async () => {
      const error: Error = await service.updatePassword('non-existing@abc-map.fr', 'azerty1234').catch((err) => err);
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'User not found: non-existing@abc-map.fr');
    });

    it('should throw if password equal email', async () => {
      const user = TestHelper.sampleUser();
      await userService.save(user);

      const error: Error = await service.updatePassword(user.email, user.email.toLocaleUpperCase()).catch((err) => err);
      assert.instanceOf(error, Error);
      assert.equal(error.message, 'Password cannot be equal to email');
    });

    it('should update password if user is known', async () => {
      const user = TestHelper.sampleUser();
      await userService.save(user);

      // Act
      await service.updatePassword(user.email, 'azerty1234');

      // Assert
      const dbUser = (await userService.findById(user.id)) as AbcUser;
      assert.equal(dbUser.id, user.id);
      assert.equal(dbUser.email, user.email);
      assert.equal(dbUser.password, await hasher.hashPassword('azerty1234', user.id));
    });
  });

  function getRegistrationToken(call = 0): Promise<RegistrationToken> {
    const token = emails.confirmRegistration.getCall(call).args[2];
    return service.verifyRegistrationToken(token).then((decoded) => {
      if (!decoded) {
        return Promise.reject(new Error(`Invalid token: ${token}`));
      }
      return decoded;
    });
  }
});
