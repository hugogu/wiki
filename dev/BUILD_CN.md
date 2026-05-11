# Building in China

If you experience network timeouts when building Docker images in China, no need to change Docker daemon config — just use build arguments.

## 1. Docker Image Mirror (No Daemon Config Needed)

All Dockerfiles support a `BASE_IMAGE` build argument. Use any mirror registry:

```bash
# Using DaoCloud mirror
docker build \
  --build-arg BASE_IMAGE=docker.m.daocloud.io/library/node:24-alpine \
  -f dev/build/Dockerfile \
  -t wiki:latest .

# Using SJTU mirror  
docker build \
  --build-arg BASE_IMAGE=docker.mirrors.sjtug.sjtu.edu.cn/library/node:24-alpine \
  -f dev/build/Dockerfile \
  -t wiki:latest .

# Using NJU mirror
docker build \
  --build-arg BASE_IMAGE=docker.nju.edu.cn/library/node:24-alpine \
  -f dev/build/Dockerfile \
  -t wiki:latest .
```

## 2. Package Mirrors (Already Configured)

The following China mirrors are automatically used in Docker builds:

### Yarn/NPM
The project includes `.yarnrc` with npmmirror (Taobao) registry:
```
registry "https://registry.npmmirror.com"
network-timeout 100000
```

### Alpine Linux Packages
Dockerfiles use USTC (University of Science and Technology of China) mirror for `apk` packages instead of the default Alpine CDN.

### Node.js Headers (for native modules)
`npm_config_disturl` is set to npmmirror's Node.js binary mirror for `node-gyp` header downloads.

## 3. Native Module Build Fix

The Dockerfiles include fixes for building native modules in the current Alpine/Node environment:

- `py3-setuptools` is installed to provide `distutils` compatibility (required by older `node-gyp` for sqlite3)
- `npm_config_build_from_source=true` is set to avoid prebuilt binary download timeouts

If you still encounter issues, ensure your base image is up to date:
```bash
docker pull docker.m.daocloud.io/library/node:24-alpine
```

## 4. Cache Control

By default, yarn cache is preserved between builds to speed up the process. If you need to clear the cache (e.g., for a clean build or CI pipeline), pass the `CACHE_CLEAN` build argument:

```bash
docker build \
  --build-arg BASE_IMAGE=docker.m.daocloud.io/library/node:24-alpine \
  --build-arg CACHE_CLEAN=true \
  -f dev/build/Dockerfile \
  -t wiki:latest .
```

**Note**: `dev/build-arm/Dockerfile` does not clear cache by default.

## 5. Layer Caching Optimization

The Dockerfiles are optimized to maximize Docker layer caching:

- **Dependency files** (`package.json`, `yarn.lock`, `.yarnrc`, `patches/`) are copied **before** source files
- **Source files** (`client/`, `dev/`, config files) are copied **after** `yarn install`

This means:
- Changing frontend code in `client/` → **reuses** cached `yarn install` layer (saves minutes!)
- Changing dependencies in `package.json` → only invalidates dependency layer

**Tip**: For fastest rebuilds during development, use Docker BuildKit with cache mounts:
```bash
DOCKER_BUILDKIT=1 docker build \
  --build-arg BASE_IMAGE=docker.m.daocloud.io/library/node:24-alpine \
  -f dev/build/Dockerfile \
  -t wiki:latest .
```
