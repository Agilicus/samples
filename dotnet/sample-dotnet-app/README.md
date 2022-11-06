## Simple Microsoft .NET Linux REST API

### Build && Run

```
docker build -t todo .
docker run -p 5000:80 --rm -it todo
```

(now open browser to http://localhost:5000)

### Local development

If you wish to run this without docker, simply
install dotnet on Linux as per
[docs](https://docs.microsoft.com/en-us/dotnet/core/linux-prerequisites?tabs=netcore2x)

For Ubuntu 18.04, this was:

```
apt-get install dotnet-sdk-2.2
```

### API

```
{"id":3,"name":"asdf","isComplete":false}

GET /api/todo
PUT /api/todo
POST /api/todo
DELETE /api/todo
```

### Upstream

Source code is derived from [TodoApi](https://github.com/aspnet/AspNetCore.Docs)
This is released under a Creative Commons "Attribution 4.0 International" license
and a MIT License, both of which are included here.

The Dockerfile and README in this directory may also be used under the same
license.

