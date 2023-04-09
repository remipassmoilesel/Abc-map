# Fake tile server

This server allows you to start lightweight WMS, WMTS, XYZ services for experiments and automated testing.

This server is started with `abc-cli start` command.

URLs and credentials:

```

    http://localhost:3010/xyz/public/{x}/{y}/{z}
    No credentials

    http://localhost:3010/xyz/authenticated/{x}/{y}/{z}?api_key=XXXXXXXX
    Api key: 5e46d49fce0

    http://localhost:3010/wms/public
    No credentials

    http://localhost:3010/wms/authenticated
    jean-bonno:azerty1234

    http://localhost:3010/wmts/public
    No credentials

    http://localhost:3010/wmts/authenticated
    jean-bonno:azerty1234

```
