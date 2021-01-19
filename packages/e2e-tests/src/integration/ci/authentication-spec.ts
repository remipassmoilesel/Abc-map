import { FrontendRoutes } from '@abc-map/shared-entities';
import { TestHelper } from '../../helpers/TestHelper';
import { Registration } from '../../helpers/Registration';
import { Login } from '../../helpers/Login';
import { Toasts } from '../../helpers/Toasts';

describe('Authentication', function () {
  beforeEach(() => {
    TestHelper.init();
  });

  it('Visitor can register and enable account', function () {
    Registration.newUser();
  });

  it('User can login if account is enabled', function () {
    const user = Registration.newUser();
    Login.login(user);

    cy.get('[data-cy=user-menu]')
      .click()
      .get('[data-cy=user-label]')
      .should((elem) => {
        expect(elem.text()).equal(user.email);
      });
  });

  it('User can not login if account is not enabled', function () {
    const user = Registration.newUser(false);
    cy.visit(FrontendRoutes.landing())
      .get('input[data-cy=login-email]')
      .type(user.email)
      .get('input[data-cy=login-password]')
      .type(user.password)
      .get('button[data-cy=login-button]')
      .click();

    Toasts.assertText('Vous devez activer votre compte avant de vous connecter');
  });

  it('User can logout', function () {
    const user = Registration.newUser();
    Login.login(user);

    cy.get('[data-cy=user-menu]').click().get('[data-cy=logout]').click();

    Toasts.assertText("Vous n'êtes plus connecté !");

    cy.get('[data-cy=user-menu]')
      .click()
      .get('[data-cy=user-label]')
      .should((elem) => {
        expect(elem.text()).equal('Visiteur');
      });
  });
});