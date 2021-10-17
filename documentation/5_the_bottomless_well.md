# The bottomless well aka backlog

* [Performance: WebASM and web worker usage](#performance-webasm-and-web-worker-usage)
* [Scale on exports](#scale-on-exports)
* [Text labels not attached to features](#text-labels-not-attached-to-features)
* [Backgrounds for text label](#backgrounds-for-text-label)
* [Users should be able to measure distances](#users-should-be-able-to-measure-distances)
* [Lines with arrows](#lines-with-arrows)
* [Better user experience](#better-user-experience)
* [Better icons and visuals](#better-icons-and-visuals)
* [Lighter deployment options](#lighter-deployment-options)
* [More unit tests on frontend, refactoring of E2E tests.](#more-unit-tests-on-frontend-refactoring-of-e2e-tests)
* [Internationalization](#internationalization)
* [Projection change](#projection-change)
* [Geopackage import](#geopackage-import)
* [Geopackage export](#geopackage-export)
* [Shapefile export](#shapefile-export)
* [Vector tiles support](#vector-tiles-support)
* [Map legend](#map-legend)
* [Custom icons](#custom-icons)
* [Images](#images)
* [Datastore artefact with prompt](#datastore-artefact-with-prompt)


## Performance: WebASM and web worker usage

We should use WebASM and web workers everywhere that is possible, in order to prevent UI freeze and to get better 
performances. 

Tasks:
- Zip / unzip of project, per example with https://gildas-lormeau.github.io/zip.js/core-api.html
- Data display in tables
- Data parsing
- Data processing
- ...


## Scale on exports

Users should be able to export scale optionally.


## Text labels not attached to features

Users should be able to create text labels without existing features. 'Standalone' text labels can be 
special polygons.


## Backgrounds for text label

Users should be able to background color of text labels. 


## Users should be able to measure distances

Users should be able to measure distances with a drawing tool. Distances should be linestring with 
text label (for exports).


## Lines with arrows

Users should be able to draw lines with arrows.


## Better user experience

All user experience is in very early stage. If you are experienced in this field and if you have concrete ideas
open an empty Merge Request to discuss.


## Better icons and visuals

Icon and visuals can be improved a lot ✏️ If you are creative but if you don't know how to integrate your work 
open an empty Merge Request to discuss.     


## Lighter deployment options

Current deployment is on Kubernetes and it is not a simple thing for everyone. We should provide at least 
a standalone script for installation on GNU/Linux. MS Windows is not a target system for deployment.    


## More unit tests on frontend, refactoring of E2E tests.

Frontend needs more unit tests, and some E2E tests needs to be refactored.   


## Internationalization

Frontend should be available in French and in English, with an extensible system.   


## Projection change

A user must be able to modify the projection of projects. By selecting a projection from a predefined list,
or by importing their own. 


## Geopackage import

A user should be able to import geopackages in map. A DataReader can be created.


## Geopackage export

A user should be able to export maps or layers as geopackages. A DataWriter can be created.


## Shapefile export

A user should be able to export layers as shapefiles. A DataWriter can be created.


## Vector tiles support

A user should be able to use vector tiles layers.


## Map legend

A user should be able to generate a legend on layout page.


## Custom icons

A user should be able to use their own icons.


## Images

A user should be able to import images.


## Datastore artefact with prompt

A user should be able to use preconfigured data layer as an artifact.       

For example, he should be able to use Mapbox layers with his own API keys, by selecting a model from the datastore and
enter the necessary information in a prompt.     

Information prompt can be described in resource manifests such as for a WMS layer:    

    remoteUrl: 'https://company.com/wms/$$key'    # $$key will be replaced by prompted value
    remoteLayerName: 'usa:states'
    username: '$$username'                        # $$userame will be replaced by prompted value
    password: '$$password'                        # $$password will be replaced by prompted value
    prompt:                   
    - name: key                                   # Prompt definitions
      labels:
      en: "API Key"
      fr: "Clé d'API"
    - name: username
      labels:
      en: "Username"
      fr: "Nom d'utilisateur"
    - name: password
      labels:
      en: "Password"
      fr: "Mot de passe"


With these prompt statements, we can build a suitable interface to enter the necessary variables, and use 
the data on map.
