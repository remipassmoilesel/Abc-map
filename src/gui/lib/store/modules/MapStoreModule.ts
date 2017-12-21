import {Actions, Mutations} from './mutationsAndActions';
import {Clients} from '../../clients/Clients';
import {Logger} from '../../../../api/dev/Logger';
import {MapView} from '../../map/MapView';
import {MapViewPayload} from './payloads';

const logger = Logger.getLogger('MapStoreModule');
const clients = new Clients();

export class MapState {
    public currentMapView: MapView = null;
}

export class MapStoreModule {

    public state = new MapState();

    // Warning: all mutations must be synchronous !
    public mutations = {
        [Mutations.MAP_VIEW_UPDATE]: (state: MapState, payload: MapViewPayload) => {
            logger.info(`Comitting mutation ${Mutations.MAP_VIEW_UPDATE}`);
            state.currentMapView = payload.view;
        },
    };

    public actions = {
        [Actions.MAP_VIEW_UPDATE]: (context, payload: MapViewPayload) => {
            logger.info(`Dispatching action ${Actions.MAP_VIEW_UPDATE}`);
            context.commit(Mutations.MAP_VIEW_UPDATE, payload);
        },
    };

    public getters = {
        currentMapView: (state: MapState) => {
            return state.currentMapView;
        },
    };

}

