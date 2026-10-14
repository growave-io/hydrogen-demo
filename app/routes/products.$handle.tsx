import {redirect} from 'react-router';
import type {Route} from './+types/products.$handle';

export function loader({params, request}: Route.LoaderArgs) {
  const {search} = new URL(request.url);
  return redirect(`/p/${params.handle}${search}`, 301);
}
