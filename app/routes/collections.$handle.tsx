import {redirect} from 'react-router';
import type {Route} from './+types/collections.$handle';

export function loader({params, request}: Route.LoaderArgs) {
  const {search} = new URL(request.url);
  return redirect(`/c/${params.handle}${search}`, 301);
}
