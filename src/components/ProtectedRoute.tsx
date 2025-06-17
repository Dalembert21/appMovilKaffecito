import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface ProtectedRouteProps extends RouteProps {
  isAuthenticated: boolean;
  redirectPath?: string;
}
//login
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  redirectPath = '/login',
  ...routeProps
}) => {
  if (!isAuthenticated) {
    return <Redirect to={redirectPath} />;
  }

  return <Route {...routeProps} />;
};

export default ProtectedRoute;
