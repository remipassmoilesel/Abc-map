import React, { Component, ReactNode } from 'react';
import { services } from '../../core/Services';
import { Logger } from '@abc-map/frontend-shared';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { FrontendRoutes } from '@abc-map/frontend-shared';
import { RegistrationStatus } from '@abc-map/shared-entities';
import LoginForm from './login/LoginForm';
import RegistrationForm from './registration/RegistrationForm';
import Cls from './Landing.module.scss';

const logger = Logger.get('Landing.tsx', 'info');

declare type Props = RouteComponentProps<any, any>;

class Landing extends Component<Props, {}> {
  private services = services();

  public render(): ReactNode {
    return (
      <div className={Cls.landing}>
        {/* Introduction */}

        <h1>Bienvenue !</h1>
        <p>
          Abc-Map est un logiciel libre de cartographie.
          <br />
          Abc-Map vous permet de créer des cartes simplement, sans connaissances techniques.
        </p>
        <p>Pour créer votre première carte efficacement:</p>
        <ul>
          <li>
            Prenez le temps de consulter <Link to={FrontendRoutes.help()}>la page Aide</Link>
          </li>
          <li>
            Commencez à créer sur la page <Link to={FrontendRoutes.map()}>la page Carte</Link>, importez des données à partir de votre navigateur ou{' '}
            <Link to={FrontendRoutes.dataStore()}>sur la page Catalogue de données</Link>
          </li>
          <li>
            Mettez en page et exportez votre carte sur <Link to={FrontendRoutes.layout()}>la page Mise en page</Link>
          </li>
        </ul>
        <p>
          Si vous souhaitez en savoir plus sur ce logiciel, <Link to={FrontendRoutes.about()}>c&apos;est par ici.</Link>
        </p>

        {/* Authentication */}

        <LoginForm onSubmit={this.authentication} />

        {/* Registration */}

        <RegistrationForm onSubmit={this.registration} />
      </div>
    );
  }

  private authentication = (email: string, password: string) => {
    const { toasts, authentication } = this.services;
    if (!email || !password) {
      toasts.info("Vous devez d'abord saisir votre email et votre mot de passe");
      return;
    }

    authentication
      .login(email, password)
      .then(() => {
        this.setState({ registrationEmail: '', registrationPassword: '' });
        return this.props.history.push(FrontendRoutes.map());
      })
      .catch((err) => {
        logger.error(err);
        toasts.genericError();
      });
  };

  private registration = (email: string, password: string) => {
    const { toasts, authentication } = this.services;

    authentication
      .register(email, password)
      .then((res) => {
        if (res.status === RegistrationStatus.EmailAlreadyExists) {
          return toasts.info('Cette adresse email est déjà prise');
        }
        if (res.status === RegistrationStatus.Successful) {
          this.setState({ registrationEmail: '', registrationPassword: '' });
          return toasts.info('Un email vient de vous être envoyé, vous devez activer votre compte');
        }
        toasts.genericError();
      })
      .catch((err) => {
        toasts.genericError();
        logger.error(err);
      });
  };
}

export default withRouter(Landing);
