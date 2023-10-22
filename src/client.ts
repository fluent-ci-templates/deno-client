import { GraphQLClient } from "../deps.ts";

import { computeQuery } from "./utils.ts";

/**
 * @hidden
 */
export type QueryTree = {
  operation: string;
  args?: Record<string, unknown>;
};

/**
 * @hidden
 */
export type Metadata = {
  [key: string]: {
    is_enum?: boolean;
  };
};

interface ClientConfig {
  queryTree?: QueryTree[];
  host?: string;
  sessionToken?: string;
}

class BaseClient {
  protected _queryTree: QueryTree[];
  protected client: GraphQLClient;
  /**
   * @defaultValue `127.0.0.1:8080`
   */
  public clientHost: string;
  public sessionToken: string;

  /**
   * @hidden
   */
  constructor({ queryTree, host, sessionToken }: ClientConfig = {}) {
    this._queryTree = queryTree || [];
    this.clientHost = host || "127.0.0.1:8080";
    this.sessionToken = sessionToken || "";

    const scheme =
      this.clientHost.startsWith("localhost") ||
      this.clientHost.split(":")[0].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)
        ? "http"
        : "https";

    const url = Deno.env.has("FLUENTCI_SESSION_ID")
      ? `${scheme}://${this.clientHost}/query?id=${Deno.env.get(
          "FLUENTCI_SESSION_ID"
        )}`
      : `${scheme}://${this.clientHost}/query`;

    this.client = new GraphQLClient(url, {
      headers: {
        Authorization: "Basic " + btoa(sessionToken + ":"),
        "X-FluentCI-Session-ID": Deno.env.get("FLUENTCI_SESSION_ID") || "",
      },
    });
  }

  /**
   * @hidden
   */
  get queryTree() {
    return this._queryTree;
  }
}

export type BuildArg = {
  /**
   * The build argument name.
   */
  name: string;

  /**
   * The build argument value.
   */
  value: string;
};

/**
 * Sharing mode of the cache volume.
 */
export enum CacheSharingMode {
  /**
   * Shares the cache volume amongst many build pipelines,
   * but will serialize the writes
   */
  Locked = "LOCKED",

  /**
   * Keeps a cache volume for a single build pipeline
   */
  Private = "PRIVATE",

  /**
   * Shares the cache volume amongst many build pipelines
   */
  Shared = "SHARED",
}
/**
 * A global cache volume identifier.
 */
export type CacheVolumeID = string & { __CacheVolumeID: never };

export type ContainerBuildOpts = {
  /**
   * Path to the Dockerfile to use.
   *
   * Default: './Dockerfile'.
   */
  dockerfile?: string;

  /**
   * Additional build arguments.
   */
  buildArgs?: BuildArg[];

  /**
   * Target build stage to build.
   */
  target?: string;

  /**
   * Secrets to pass to the build.
   *
   * They will be mounted at /run/secrets/[secret-name] in the build container
   *
   * They can be accessed in the Dockerfile using the "secret" mount type
   * and mount path /run/secrets/[secret-name]
   * e.g. RUN --mount=type=secret,id=my-secret curl url?token=$(cat /run/secrets/my-secret)"
   */
  secrets?: Secret[];
};

export type ContainerEndpointOpts = {
  /**
   * The exposed port number for the endpoint
   */
  port?: number;

  /**
   * Return a URL with the given scheme, eg. http for http://
   */
  scheme?: string;
};

export type ContainerExportOpts = {
  /**
   * Identifiers for other platform specific containers.
   * Used for multi-platform image.
   */
  platformVariants?: Container[];

  /**
   * Force each layer of the exported image to use the specified compression algorithm.
   * If this is unset, then if a layer already has a compressed blob in the engine's
   * cache, that will be used (this can result in a mix of compression algorithms for
   * different layers). If this is unset and a layer has no compressed blob in the
   * engine's cache, then it will be compressed using Gzip.
   */
  forcedCompression?: ImageLayerCompression;

  /**
   * Use the specified media types for the exported image's layers. Defaults to OCI, which
   * is largely compatible with most recent container runtimes, but Docker may be needed
   * for older runtimes without OCI support.
   */
  mediaTypes?: ImageMediaTypes;
};

export type ContainerImportOpts = {
  /**
   * Identifies the tag to import from the archive, if the archive bundles
   * multiple tags.
   */
  tag?: string;
};

export type ContainerPipelineOpts = {
  /**
   * Pipeline description.
   */
  description?: string;

  /**
   * Pipeline labels.
   */
  labels?: PipelineLabel[];
};

export type ContainerPublishOpts = {
  /**
   * Identifiers for other platform specific containers.
   * Used for multi-platform image.
   */
  platformVariants?: Container[];

  /**
   * Force each layer of the published image to use the specified compression algorithm.
   * If this is unset, then if a layer already has a compressed blob in the engine's
   * cache, that will be used (this can result in a mix of compression algorithms for
   * different layers). If this is unset and a layer has no compressed blob in the
   * engine's cache, then it will be compressed using Gzip.
   */
  forcedCompression?: ImageLayerCompression;

  /**
   * Use the specified media types for the published image's layers. Defaults to OCI, which
   * is largely compatible with most recent registries, but Docker may be needed for older
   * registries without OCI support.
   */
  mediaTypes?: ImageMediaTypes;
};

export type ContainerWithDefaultArgsOpts = {
  /**
   * Arguments to prepend to future executions (e.g., ["-v", "--no-cache"]).
   */
  args?: string[];
};

export type ContainerWithDirectoryOpts = {
  /**
   * Patterns to exclude in the written directory (e.g., ["node_modules/**", ".gitignore", ".git/"]).
   */
  exclude?: string[];

  /**
   * Patterns to include in the written directory (e.g., ["*.go", "go.mod", "go.sum"]).
   */
  include?: string[];

  /**
   * A user:group to set for the directory and its contents.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithEnvVariableOpts = {
  /**
   * Replace ${VAR} or $VAR in the value according to the current environment
   * variables defined in the container (e.g., "/opt/bin:$PATH").
   */
  expand?: boolean;
};

export type ContainerWithExecOpts = {
  /**
   * If the container has an entrypoint, ignore it for args rather than using it to wrap them.
   */
  skipEntrypoint?: boolean;

  /**
   * Content to write to the command's standard input before closing (e.g., "Hello world").
   */
  stdin?: string;

  /**
   * Redirect the command's standard output to a file in the container (e.g., "/tmp/stdout").
   */
  redirectStdout?: string;

  /**
   * Redirect the command's standard error to a file in the container (e.g., "/tmp/stderr").
   */
  redirectStderr?: string;

  /**
   * Provides dagger access to the executed command.
   *
   * Do not use this option unless you trust the command being executed.
   * The command being executed WILL BE GRANTED FULL ACCESS TO YOUR HOST FILESYSTEM.
   */
  experimentalPrivilegedNesting?: boolean;

  /**
   * Execute the command with all root capabilities. This is similar to running a command
   * with "sudo" or executing `docker run` with the `--privileged` flag. Containerization
   * does not provide any security guarantees when using this option. It should only be used
   * when absolutely necessary and only with trusted commands.
   */
  insecureRootCapabilities?: boolean;
};

export type ContainerWithExposedPortOpts = {
  /**
   * Transport layer network protocol
   */
  protocol?: NetworkProtocol;

  /**
   * Optional port description
   */
  description?: string;
};

export type ContainerWithFileOpts = {
  /**
   * Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   */
  permissions?: number;

  /**
   * A user:group to set for the file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithMountedCacheOpts = {
  /**
   * Identifier of the directory to use as the cache volume's root.
   */
  source?: Directory;

  /**
   * Sharing mode of the cache volume.
   */
  sharing?: CacheSharingMode;

  /**
   * A user:group to set for the mounted cache directory.
   *
   * Note that this changes the ownership of the specified mount along with the
   * initial filesystem provided by source (if any). It does not have any effect
   * if/when the cache has already been created.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithMountedDirectoryOpts = {
  /**
   * A user:group to set for the mounted directory and its contents.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithMountedFileOpts = {
  /**
   * A user or user:group to set for the mounted file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithMountedSecretOpts = {
  /**
   * A user:group to set for the mounted secret.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;

  /**
   * Permission given to the mounted secret (e.g., 0600).
   * This option requires an owner to be set to be active.
   *
   * Default: 0400.
   */
  mode?: number;
};

export type ContainerWithNewFileOpts = {
  /**
   * Content of the file to write (e.g., "Hello world!").
   */
  contents?: string;

  /**
   * Permission given to the written file (e.g., 0600).
   *
   * Default: 0644.
   */
  permissions?: number;

  /**
   * A user:group to set for the file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithUnixSocketOpts = {
  /**
   * A user:group to set for the mounted socket.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  owner?: string;
};

export type ContainerWithoutExposedPortOpts = {
  /**
   * Port protocol to unexpose
   */
  protocol?: NetworkProtocol;
};

/**
 * A unique container identifier. Null designates an empty container (scratch).
 */
export type ContainerID = string & { __ContainerID: never };

/**
 * The `DateTime` scalar type represents a DateTime. The DateTime is serialized as an RFC 3339 quoted string
 */
export type DateTime = string & { __DateTime: never };

export type DirectoryAsModuleOpts = {
  /**
   * An optional subpath of the directory which contains the module's source
   * code.
   *
   * This is needed when the module code is in a subdirectory but requires
   * parent directories to be loaded in order to execute. For example, the
   * module source code may need a go.mod, project.toml, package.json, etc. file
   * from a parent directory.
   *
   * If not set, the module source code is loaded from the root of the
   * directory.
   */
  sourceSubpath?: string;

  /**
   * A pre-built runtime container to use instead of building one from the
   * source code. This is useful for bootstrapping.
   *
   * You should ignore this unless you're building a Dagger SDK.
   */
  runtime?: Container;
};

export type DirectoryDockerBuildOpts = {
  /**
   * Path to the Dockerfile to use (e.g., "frontend.Dockerfile").
   *
   * Defaults: './Dockerfile'.
   */
  dockerfile?: string;

  /**
   * The platform to build.
   */
  platform?: Platform;

  /**
   * Build arguments to use in the build.
   */
  buildArgs?: BuildArg[];

  /**
   * Target build stage to build.
   */
  target?: string;

  /**
   * Secrets to pass to the build.
   *
   * They will be mounted at /run/secrets/[secret-name].
   */
  secrets?: Secret[];
};

export type DirectoryEntriesOpts = {
  /**
   * Location of the directory to look at (e.g., "/src").
   */
  path?: string;
};

export type DirectoryPipelineOpts = {
  /**
   * Pipeline description.
   */
  description?: string;

  /**
   * Pipeline labels.
   */
  labels?: PipelineLabel[];
};

export type DirectoryWithDirectoryOpts = {
  /**
   * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
   */
  exclude?: string[];

  /**
   * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
   */
  include?: string[];
};

export type DirectoryWithFileOpts = {
  /**
   * Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   */
  permissions?: number;
};

export type DirectoryWithNewDirectoryOpts = {
  /**
   * Permission granted to the created directory (e.g., 0777).
   *
   * Default: 0755.
   */
  permissions?: number;
};

export type DirectoryWithNewFileOpts = {
  /**
   * Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   */
  permissions?: number;
};

/**
 * A content-addressed directory identifier.
 */
export type DirectoryID = string & { __DirectoryID: never };

export type FileExportOpts = {
  /**
   * If allowParentDirPath is true, the path argument can be a directory path, in which case
   * the file will be created in that directory.
   */
  allowParentDirPath?: boolean;
};

/**
 * A file identifier.
 */
export type FileID = string & { __FileID: never };

export type FunctionCallOpts = {
  input?: FunctionCallInput[];
};

export type FunctionWithArgOpts = {
  /**
   * A doc string for the argument, if any
   */
  description?: string;

  /**
   * A default value to use for this argument if not explicitly set by the caller, if any
   */
  defaultValue?: JSON;
};

/**
 * A reference to a FunctionArg.
 */
export type FunctionArgID = string & { __FunctionArgID: never };

export type FunctionCallInput = {
  /**
   * The name of the argument to the function
   */
  name: string;

  /**
   * The value of the argument represented as a string of the JSON serialization.
   */
  value: JSON;
};

/**
 * A reference to a Function.
 */
export type FunctionID = string & { __FunctionID: never };

/**
 * A reference to GeneratedCode.
 */
export type GeneratedCodeID = string & { __GeneratedCodeID: never };

export type GitRefTreeOpts = {
  sshKnownHosts?: string;
  sshAuthSocket?: Socket;
};

export type HostDirectoryOpts = {
  /**
   * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
   */
  exclude?: string[];

  /**
   * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
   */
  include?: string[];
};

/**
 * The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
 */
export type ID = string & { __ID: never };

/**
 * Compression algorithm to use for image layers.
 */
export enum ImageLayerCompression {
  Estargz = "EStarGZ",
  Gzip = "Gzip",
  Uncompressed = "Uncompressed",
  Zstd = "Zstd",
}
/**
 * Mediatypes to use in published or exported image metadata.
 */
export enum ImageMediaTypes {
  Dockermediatypes = "DockerMediaTypes",
  Ocimediatypes = "OCIMediaTypes",
}
/**
 * An arbitrary JSON-encoded value.
 */
export type JSON = string & { __JSON: never };

export type ModuleServeOpts = {
  environment?: ModuleEnvironmentVariable[];
};

export type ModuleEnvironmentVariable = {
  name: string;
  value?: string;
};

/**
 * A reference to a Module.
 */
export type ModuleID = string & { __ModuleID: never };

/**
 * Transport layer network protocol associated to a port.
 */
export enum NetworkProtocol {
  /**
   * TCP (Transmission Control Protocol)
   */
  Tcp = "TCP",

  /**
   * UDP (User Datagram Protocol)
   */
  Udp = "UDP",
}
export type PipelineLabel = {
  /**
   * Label name.
   */
  name: string;

  /**
   * Label value.
   */
  value: string;
};

/**
 * The platform config OS and architecture in a Container.
 *
 * The format is [os]/[platform]/[version] (e.g., "darwin/arm64/v7", "windows/amd64", "linux/arm64").
 */
export type Platform = string & { __Platform: never };

export type ClientContainerOpts = {
  id?: ContainerID;
  platform?: Platform;
};

export type ClientDirectoryOpts = {
  id?: DirectoryID;
};

export type ClientGitOpts = {
  /**
   * Set to true to keep .git directory.
   */
  keepGitDir?: boolean;

  /**
   * A service which must be started before the repo is fetched.
   */
  experimentalServiceHost?: Container;
};

export type ClientHttpOpts = {
  /**
   * A service which must be started before the URL is fetched.
   */
  experimentalServiceHost?: Container;
};

export type ClientPipelineOpts = {
  /**
   * Pipeline description.
   */
  description?: string;

  /**
   * Pipeline labels.
   */
  labels?: PipelineLabel[];
};

export type ClientSocketOpts = {
  id?: SocketID;
};

/**
 * A unique identifier for a secret.
 */
export type SecretID = string & { __SecretID: never };

/**
 * A content-addressed socket identifier.
 */
export type SocketID = string & { __SocketID: never };

export type TypeDefWithFieldOpts = {
  /**
   * A doc string for the field, if any
   */
  description?: string;
};

export type TypeDefWithObjectOpts = {
  description?: string;
};

/**
 * A reference to a TypeDef.
 */
export type TypeDefID = string & { __TypeDefID: never };

/**
 * Distinguishes the different kinds of TypeDefs.
 */
export enum TypeDefKind {
  /**
   * A boolean value
   */
  Booleankind = "BooleanKind",

  /**
   * An integer value
   */
  Integerkind = "IntegerKind",

  /**
   * A list of values all having the same type.
   *
   * Always paired with a ListTypeDef.
   */
  Listkind = "ListKind",

  /**
   * A named type defined in the GraphQL schema, with fields and functions.
   *
   * Always paired with an ObjectTypeDef.
   */
  Objectkind = "ObjectKind",

  /**
   * A string value
   */
  Stringkind = "StringKind",

  /**
   * A special kind used to signify that no value is returned.
   *
   * This is used for functions that have no return value. The outer TypeDef
   * specifying this Kind is always Optional, as the Void is never actually
   * represented.
   */
  Voidkind = "VoidKind",
}
/**
 * The absense of a value.
 *
 * A Null Void is used as a placeholder for resolvers that do not return anything.
 */
export type Void = string & { __Void: never };

export type __TypeEnumValuesOpts = {
  includeDeprecated?: boolean;
};

export type __TypeFieldsOpts = {
  includeDeprecated?: boolean;
};

/**
 * A directory whose contents persist across runs.
 */
export class CacheVolume extends BaseClient {
  private readonly _id?: CacheVolumeID = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: CacheVolumeID
  ) {
    super(parent);

    this._id = _id;
  }
  async id(): Promise<CacheVolumeID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<CacheVolumeID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }
}

/**
 * An OCI-compatible container, also known as a docker container.
 */
export class Container extends BaseClient {
  private readonly _id?: ContainerID = undefined;
  private readonly _endpoint?: string = undefined;
  private readonly _envVariable?: string = undefined;
  private readonly _export?: boolean = undefined;
  private readonly _hostname?: string = undefined;
  private readonly _imageRef?: string = undefined;
  private readonly _label?: string = undefined;
  private readonly _platform?: Platform = undefined;
  private readonly _publish?: string = undefined;
  private readonly _shellEndpoint?: string = undefined;
  private readonly _stderr?: string = undefined;
  private readonly _stdout?: string = undefined;
  private readonly _sync?: ContainerID = undefined;
  private readonly _user?: string = undefined;
  private readonly _workdir?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: ContainerID,
    _endpoint?: string,
    _envVariable?: string,
    _export?: boolean,
    _hostname?: string,
    _imageRef?: string,
    _label?: string,
    _platform?: Platform,
    _publish?: string,
    _shellEndpoint?: string,
    _stderr?: string,
    _stdout?: string,
    _sync?: ContainerID,
    _user?: string,
    _workdir?: string
  ) {
    super(parent);

    this._id = _id;
    this._endpoint = _endpoint;
    this._envVariable = _envVariable;
    this._export = _export;
    this._hostname = _hostname;
    this._imageRef = _imageRef;
    this._label = _label;
    this._platform = _platform;
    this._publish = _publish;
    this._shellEndpoint = _shellEndpoint;
    this._stderr = _stderr;
    this._stdout = _stdout;
    this._sync = _sync;
    this._user = _user;
    this._workdir = _workdir;
  }

  /**
   * A unique identifier for this container.
   */
  async id(): Promise<ContainerID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<ContainerID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Initializes this container from a Dockerfile build.
   * @param context Directory context used by the Dockerfile.
   * @param opts.dockerfile Path to the Dockerfile to use.
   *
   * Default: './Dockerfile'.
   * @param opts.buildArgs Additional build arguments.
   * @param opts.target Target build stage to build.
   * @param opts.secrets Secrets to pass to the build.
   *
   * They will be mounted at /run/secrets/[secret-name] in the build container
   *
   * They can be accessed in the Dockerfile using the "secret" mount type
   * and mount path /run/secrets/[secret-name]
   * e.g. RUN --mount=type=secret,id=my-secret curl url?token=$(cat /run/secrets/my-secret)"
   */
  build(context: Directory, opts?: ContainerBuildOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "build",
          args: { context, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves default arguments for future commands.
   */
  async defaultArgs(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "defaultArgs",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves a directory at the given path.
   *
   * Mounts are included.
   * @param path The path of the directory to retrieve (e.g., "./src").
   */
  directory(path: string): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "directory",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves an endpoint that clients can use to reach this container.
   *
   * If no port is specified, the first exposed port is used. If none exist an error is returned.
   *
   * If a scheme is specified, a URL is returned. Otherwise, a host:port pair is returned.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   * @param opts.port The exposed port number for the endpoint
   * @param opts.scheme Return a URL with the given scheme, eg. http for http://
   */
  async endpoint(opts?: ContainerEndpointOpts): Promise<string> {
    if (this._endpoint) {
      return this._endpoint;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "endpoint",
          args: { ...opts },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves entrypoint to be prepended to the arguments of all commands.
   */
  async entrypoint(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "entrypoint",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves the value of the specified environment variable.
   * @param name The name of the environment variable to retrieve (e.g., "PATH").
   */
  async envVariable(name: string): Promise<string> {
    if (this._envVariable) {
      return this._envVariable;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "envVariable",
          args: { name },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves the list of environment variables passed to commands.
   */
  async envVariables(): Promise<EnvVariable[]> {
    type envVariables = {
      name: string;
      value: string;
    };

    const response: Awaited<envVariables[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "envVariables",
        },
        {
          operation: "name value",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new EnvVariable(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.name,
          r.value
        )
    );
  }

  /**
   * Writes the container as an OCI tarball to the destination file path on the host for the specified platform variants.
   *
   * Return true on success.
   * It can also publishes platform variants.
   * @param path Host's destination path (e.g., "./tarball").
   * Path can be relative to the engine's workdir or absolute.
   * @param opts.platformVariants Identifiers for other platform specific containers.
   * Used for multi-platform image.
   * @param opts.forcedCompression Force each layer of the exported image to use the specified compression algorithm.
   * If this is unset, then if a layer already has a compressed blob in the engine's
   * cache, that will be used (this can result in a mix of compression algorithms for
   * different layers). If this is unset and a layer has no compressed blob in the
   * engine's cache, then it will be compressed using Gzip.
   * @param opts.mediaTypes Use the specified media types for the exported image's layers. Defaults to OCI, which
   * is largely compatible with most recent container runtimes, but Docker may be needed
   * for older runtimes without OCI support.
   */
  async export(path: string, opts?: ContainerExportOpts): Promise<boolean> {
    if (this._export) {
      return this._export;
    }

    const metadata: Metadata = {
      forcedCompression: { is_enum: true },
      mediaTypes: { is_enum: true },
    };

    const response: Awaited<boolean> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "export",
          args: { path, ...opts, __metadata: metadata },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves the list of exposed ports.
   *
   * This includes ports already exposed by the image, even if not
   * explicitly added with dagger.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   */
  async exposedPorts(): Promise<Port[]> {
    type exposedPorts = {
      description: string;
      port: number;
      protocol: NetworkProtocol;
    };

    const response: Awaited<exposedPorts[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "exposedPorts",
        },
        {
          operation: "description port protocol",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new Port(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.description,
          r.port,
          r.protocol
        )
    );
  }

  /**
   * Retrieves a file at the given path.
   *
   * Mounts are included.
   * @param path The path of the file to retrieve (e.g., "./README.md").
   */
  file(path: string): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "file",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Initializes this container from a pulled base image.
   * @param address Image's address from its registry.
   *
   * Formatted as [host]/[user]/[repo]:[tag] (e.g., "docker.io/dagger/dagger:main").
   */
  from(address: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "from",
          args: { address },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves a hostname which can be used by clients to reach this container.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   */
  async hostname(): Promise<string> {
    if (this._hostname) {
      return this._hostname;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "hostname",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The unique image reference which can only be retrieved immediately after the 'Container.From' call.
   */
  async imageRef(): Promise<string> {
    if (this._imageRef) {
      return this._imageRef;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "imageRef",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Reads the container from an OCI tarball.
   *
   * NOTE: this involves unpacking the tarball to an OCI store on the host at
   * $XDG_CACHE_DIR/dagger/oci. This directory can be removed whenever you like.
   * @param source File to read the container from.
   * @param opts.tag Identifies the tag to import from the archive, if the archive bundles
   * multiple tags.
   */
  import_(source: File, opts?: ContainerImportOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "import",
          args: { source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves the value of the specified label.
   */
  async label(name: string): Promise<string> {
    if (this._label) {
      return this._label;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "label",
          args: { name },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves the list of labels passed to container.
   */
  async labels(): Promise<Label[]> {
    type labels = {
      name: string;
      value: string;
    };

    const response: Awaited<labels[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "labels",
        },
        {
          operation: "name value",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new Label(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.name,
          r.value
        )
    );
  }

  /**
   * Retrieves the list of paths where a directory is mounted.
   */
  async mounts(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "mounts",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Creates a named sub-pipeline
   * @param name Pipeline name.
   * @param opts.description Pipeline description.
   * @param opts.labels Pipeline labels.
   */
  pipeline(name: string, opts?: ContainerPipelineOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "pipeline",
          args: { name, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The platform this container executes and publishes as.
   */
  async platform(): Promise<Platform> {
    if (this._platform) {
      return this._platform;
    }

    const response: Awaited<Platform> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "platform",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Publishes this container as a new image to the specified address.
   *
   * Publish returns a fully qualified ref.
   * It can also publish platform variants.
   * @param address Registry's address to publish the image to.
   *
   * Formatted as [host]/[user]/[repo]:[tag] (e.g. "docker.io/dagger/dagger:main").
   * @param opts.platformVariants Identifiers for other platform specific containers.
   * Used for multi-platform image.
   * @param opts.forcedCompression Force each layer of the published image to use the specified compression algorithm.
   * If this is unset, then if a layer already has a compressed blob in the engine's
   * cache, that will be used (this can result in a mix of compression algorithms for
   * different layers). If this is unset and a layer has no compressed blob in the
   * engine's cache, then it will be compressed using Gzip.
   * @param opts.mediaTypes Use the specified media types for the published image's layers. Defaults to OCI, which
   * is largely compatible with most recent registries, but Docker may be needed for older
   * registries without OCI support.
   */
  async publish(address: string, opts?: ContainerPublishOpts): Promise<string> {
    if (this._publish) {
      return this._publish;
    }

    const metadata: Metadata = {
      forcedCompression: { is_enum: true },
      mediaTypes: { is_enum: true },
    };

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "publish",
          args: { address, ...opts, __metadata: metadata },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves this container's root filesystem. Mounts are not included.
   */
  rootfs(): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "rootfs",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Return a websocket endpoint that, if connected to, will start the container with a TTY streamed
   * over the websocket.
   *
   * Primarily intended for internal use with the dagger CLI.
   */
  async shellEndpoint(): Promise<string> {
    if (this._shellEndpoint) {
      return this._shellEndpoint;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "shellEndpoint",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The error stream of the last executed command.
   *
   * Will execute default command if none is set, or error if there's no default.
   */
  async stderr(): Promise<string> {
    if (this._stderr) {
      return this._stderr;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "stderr",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The output stream of the last executed command.
   *
   * Will execute default command if none is set, or error if there's no default.
   */
  async stdout(): Promise<string> {
    if (this._stdout) {
      return this._stdout;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "stdout",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Forces evaluation of the pipeline in the engine.
   *
   * It doesn't run the default command if no exec has been set.
   */
  async sync(): Promise<Container> {
    await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sync",
        },
      ],
      this.client
    );

    return this;
  }

  /**
   * Retrieves the user to be set for all commands.
   */
  async user(): Promise<string> {
    if (this._user) {
      return this._user;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "user",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Configures default arguments for future commands.
   * @param opts.args Arguments to prepend to future executions (e.g., ["-v", "--no-cache"]).
   */
  withDefaultArgs(opts?: ContainerWithDefaultArgsOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withDefaultArgs",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a directory written at the given path.
   * @param path Location of the written directory (e.g., "/tmp/directory").
   * @param directory Identifier of the directory to write
   * @param opts.exclude Patterns to exclude in the written directory (e.g., ["node_modules/**", ".gitignore", ".git/"]).
   * @param opts.include Patterns to include in the written directory (e.g., ["*.go", "go.mod", "go.sum"]).
   * @param opts.owner A user:group to set for the directory and its contents.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withDirectory(
    path: string,
    directory: Directory,
    opts?: ContainerWithDirectoryOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withDirectory",
          args: { path, directory, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container but with a different command entrypoint.
   * @param args Entrypoint to use for future executions (e.g., ["go", "run"]).
   */
  withEntrypoint(args: string[]): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withEntrypoint",
          args: { args },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus the given environment variable.
   * @param name The name of the environment variable (e.g., "HOST").
   * @param value The value of the environment variable. (e.g., "localhost").
   * @param opts.expand Replace ${VAR} or $VAR in the value according to the current environment
   * variables defined in the container (e.g., "/opt/bin:$PATH").
   */
  withEnvVariable(
    name: string,
    value: string,
    opts?: ContainerWithEnvVariableOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withEnvVariable",
          args: { name, value, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container after executing the specified command inside it.
   * @param args Command to run instead of the container's default command (e.g., ["run", "main.go"]).
   *
   * If empty, the container's default command is used.
   * @param opts.skipEntrypoint If the container has an entrypoint, ignore it for args rather than using it to wrap them.
   * @param opts.stdin Content to write to the command's standard input before closing (e.g., "Hello world").
   * @param opts.redirectStdout Redirect the command's standard output to a file in the container (e.g., "/tmp/stdout").
   * @param opts.redirectStderr Redirect the command's standard error to a file in the container (e.g., "/tmp/stderr").
   * @param opts.experimentalPrivilegedNesting Provides dagger access to the executed command.
   *
   * Do not use this option unless you trust the command being executed.
   * The command being executed WILL BE GRANTED FULL ACCESS TO YOUR HOST FILESYSTEM.
   * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command
   * with "sudo" or executing `docker run` with the `--privileged` flag. Containerization
   * does not provide any security guarantees when using this option. It should only be used
   * when absolutely necessary and only with trusted commands.
   */
  withExec(args: string[], opts?: ContainerWithExecOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withExec",
          args: { args, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Expose a network port.
   *
   * Exposed ports serve two purposes:
   *   - For health checks and introspection, when running services
   *   - For setting the EXPOSE OCI field when publishing the container
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   * @param port Port number to expose
   * @param opts.protocol Transport layer network protocol
   * @param opts.description Optional port description
   */
  withExposedPort(
    port: number,
    opts?: ContainerWithExposedPortOpts
  ): Container {
    const metadata: Metadata = {
      protocol: { is_enum: true },
    };

    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withExposedPort",
          args: { port, ...opts, __metadata: metadata },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus the contents of the given file copied to the given path.
   * @param path Location of the copied file (e.g., "/tmp/file.txt").
   * @param source Identifier of the file to copy.
   * @param opts.permissions Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   * @param opts.owner A user:group to set for the file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withFile(
    path: string,
    source: File,
    opts?: ContainerWithFileOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withFile",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Indicate that subsequent operations should be featured more prominently in
   * the UI.
   */
  withFocus(): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withFocus",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus the given label.
   * @param name The name of the label (e.g., "org.opencontainers.artifact.created").
   * @param value The value of the label (e.g., "2023-01-01T00:00:00Z").
   */
  withLabel(name: string, value: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withLabel",
          args: { name, value },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a cache volume mounted at the given path.
   * @param path Location of the cache directory (e.g., "/cache/node_modules").
   * @param cache Identifier of the cache volume to mount.
   * @param opts.source Identifier of the directory to use as the cache volume's root.
   * @param opts.sharing Sharing mode of the cache volume.
   * @param opts.owner A user:group to set for the mounted cache directory.
   *
   * Note that this changes the ownership of the specified mount along with the
   * initial filesystem provided by source (if any). It does not have any effect
   * if/when the cache has already been created.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withMountedCache(
    path: string,
    cache: CacheVolume,
    opts?: ContainerWithMountedCacheOpts
  ): Container {
    const metadata: Metadata = {
      sharing: { is_enum: true },
    };

    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedCache",
          args: { path, cache, ...opts, __metadata: metadata },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a directory mounted at the given path.
   * @param path Location of the mounted directory (e.g., "/mnt/directory").
   * @param source Identifier of the mounted directory.
   * @param opts.owner A user:group to set for the mounted directory and its contents.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withMountedDirectory(
    path: string,
    source: Directory,
    opts?: ContainerWithMountedDirectoryOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedDirectory",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a file mounted at the given path.
   * @param path Location of the mounted file (e.g., "/tmp/file.txt").
   * @param source Identifier of the mounted file.
   * @param opts.owner A user or user:group to set for the mounted file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withMountedFile(
    path: string,
    source: File,
    opts?: ContainerWithMountedFileOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedFile",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a secret mounted into a file at the given path.
   * @param path Location of the secret file (e.g., "/tmp/secret.txt").
   * @param source Identifier of the secret to mount.
   * @param opts.owner A user:group to set for the mounted secret.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   * @param opts.mode Permission given to the mounted secret (e.g., 0600).
   * This option requires an owner to be set to be active.
   *
   * Default: 0400.
   */
  withMountedSecret(
    path: string,
    source: Secret,
    opts?: ContainerWithMountedSecretOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedSecret",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a temporary directory mounted at the given path.
   * @param path Location of the temporary directory (e.g., "/tmp/temp_dir").
   */
  withMountedTemp(path: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedTemp",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a new file written at the given path.
   * @param path Location of the written file (e.g., "/tmp/file.txt").
   * @param opts.contents Content of the file to write (e.g., "Hello world!").
   * @param opts.permissions Permission given to the written file (e.g., 0600).
   *
   * Default: 0644.
   * @param opts.owner A user:group to set for the file.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withNewFile(path: string, opts?: ContainerWithNewFileOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withNewFile",
          args: { path, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container with a registry authentication for a given address.
   * @param address Registry's address to bind the authentication to.
   * Formatted as [host]/[user]/[repo]:[tag] (e.g. docker.io/dagger/dagger:main).
   * @param username The username of the registry's account (e.g., "Dagger").
   * @param secret The API key, password or token to authenticate to this registry.
   */
  withRegistryAuth(
    address: string,
    username: string,
    secret: Secret
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withRegistryAuth",
          args: { address, username, secret },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Initializes this container from this DirectoryID.
   */
  withRootfs(directory: Directory): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withRootfs",
          args: { directory },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus an env variable containing the given secret.
   * @param name The name of the secret variable (e.g., "API_SECRET").
   * @param secret The identifier of the secret value.
   */
  withSecretVariable(name: string, secret: Secret): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withSecretVariable",
          args: { name, secret },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Establish a runtime dependency on a service.
   *
   * The service will be started automatically when needed and detached when it is
   * no longer needed, executing the default command if none is set.
   *
   * The service will be reachable from the container via the provided hostname alias.
   *
   * The service dependency will also convey to any files or directories produced by the container.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   * @param alias A name that can be used to reach the service from the container
   * @param service Identifier of the service container
   */
  withServiceBinding(alias: string, service: Container): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withServiceBinding",
          args: { alias, service },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container plus a socket forwarded to the given Unix socket path.
   * @param path Location of the forwarded Unix socket (e.g., "/tmp/socket").
   * @param source Identifier of the socket to forward.
   * @param opts.owner A user:group to set for the mounted socket.
   *
   * The user and group can either be an ID (1000:1000) or a name (foo:bar).
   *
   * If the group is omitted, it defaults to the same as the user.
   */
  withUnixSocket(
    path: string,
    source: Socket,
    opts?: ContainerWithUnixSocketOpts
  ): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withUnixSocket",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container with a different command user.
   * @param name The user to set (e.g., "root").
   */
  withUser(name: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withUser",
          args: { name },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container with a different working directory.
   * @param path The path to set as the working directory (e.g., "/app").
   */
  withWorkdir(path: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withWorkdir",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container minus the given environment variable.
   * @param name The name of the environment variable (e.g., "HOST").
   */
  withoutEnvVariable(name: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutEnvVariable",
          args: { name },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Unexpose a previously exposed port.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   * @param port Port number to unexpose
   * @param opts.protocol Port protocol to unexpose
   */
  withoutExposedPort(
    port: number,
    opts?: ContainerWithoutExposedPortOpts
  ): Container {
    const metadata: Metadata = {
      protocol: { is_enum: true },
    };

    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutExposedPort",
          args: { port, ...opts, __metadata: metadata },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Indicate that subsequent operations should not be featured more prominently
   * in the UI.
   *
   * This is the initial state of all containers.
   */
  withoutFocus(): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutFocus",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container minus the given environment label.
   * @param name The name of the label to remove (e.g., "org.opencontainers.artifact.created").
   */
  withoutLabel(name: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutLabel",
          args: { name },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container after unmounting everything at the given path.
   * @param path Location of the cache directory (e.g., "/cache/node_modules").
   */
  withoutMount(path: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutMount",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container without the registry authentication of a given address.
   * @param address Registry's address to remove the authentication from.
   * Formatted as [host]/[user]/[repo]:[tag] (e.g. docker.io/dagger/dagger:main).
   */
  withoutRegistryAuth(address: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutRegistryAuth",
          args: { address },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this container with a previously added Unix socket removed.
   * @param path Location of the socket to remove (e.g., "/tmp/socket").
   */
  withoutUnixSocket(path: string): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutUnixSocket",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves the working directory for all commands.
   */
  async workdir(): Promise<string> {
    if (this._workdir) {
      return this._workdir;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "workdir",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Call the provided function with current Container.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: Container) => Container) {
    return arg(this);
  }
}

/**
 * A directory.
 */
export class Directory extends BaseClient {
  private readonly _id?: DirectoryID = undefined;
  private readonly _export?: boolean = undefined;
  private readonly _sync?: DirectoryID = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: DirectoryID,
    _export?: boolean,
    _sync?: DirectoryID
  ) {
    super(parent);

    this._id = _id;
    this._export = _export;
    this._sync = _sync;
  }

  /**
   * The content-addressed identifier of the directory.
   */
  async id(): Promise<DirectoryID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<DirectoryID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Load the directory as a Dagger module
   * @param opts.sourceSubpath An optional subpath of the directory which contains the module's source
   * code.
   *
   * This is needed when the module code is in a subdirectory but requires
   * parent directories to be loaded in order to execute. For example, the
   * module source code may need a go.mod, project.toml, package.json, etc. file
   * from a parent directory.
   *
   * If not set, the module source code is loaded from the root of the
   * directory.
   * @param opts.runtime A pre-built runtime container to use instead of building one from the
   * source code. This is useful for bootstrapping.
   *
   * You should ignore this unless you're building a Dagger SDK.
   */
  asModule(opts?: DirectoryAsModuleOpts): Module_ {
    return new Module_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "asModule",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Gets the difference between this directory and an another directory.
   * @param other Identifier of the directory to compare.
   */
  diff(other: Directory): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "diff",
          args: { other },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves a directory at the given path.
   * @param path Location of the directory to retrieve (e.g., "/src").
   */
  directory(path: string): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "directory",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Builds a new Docker container from this directory.
   * @param opts.dockerfile Path to the Dockerfile to use (e.g., "frontend.Dockerfile").
   *
   * Defaults: './Dockerfile'.
   * @param opts.platform The platform to build.
   * @param opts.buildArgs Build arguments to use in the build.
   * @param opts.target Target build stage to build.
   * @param opts.secrets Secrets to pass to the build.
   *
   * They will be mounted at /run/secrets/[secret-name].
   */
  dockerBuild(opts?: DirectoryDockerBuildOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "dockerBuild",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns a list of files and directories at the given path.
   * @param opts.path Location of the directory to look at (e.g., "/src").
   */
  async entries(opts?: DirectoryEntriesOpts): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "entries",
          args: { ...opts },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Writes the contents of the directory to a path on the host.
   * @param path Location of the copied directory (e.g., "logs/").
   */
  async export(path: string): Promise<boolean> {
    if (this._export) {
      return this._export;
    }

    const response: Awaited<boolean> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "export",
          args: { path },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves a file at the given path.
   * @param path Location of the file to retrieve (e.g., "README.md").
   */
  file(path: string): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "file",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Creates a named sub-pipeline
   * @param name Pipeline name.
   * @param opts.description Pipeline description.
   * @param opts.labels Pipeline labels.
   */
  pipeline(name: string, opts?: DirectoryPipelineOpts): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "pipeline",
          args: { name, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Force evaluation in the engine.
   */
  async sync(): Promise<Directory> {
    await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sync",
        },
      ],
      this.client
    );

    return this;
  }

  /**
   * Retrieves this directory plus a directory written at the given path.
   * @param path Location of the written directory (e.g., "/src/").
   * @param directory Identifier of the directory to copy.
   * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
   * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
   */
  withDirectory(
    path: string,
    directory: Directory,
    opts?: DirectoryWithDirectoryOpts
  ): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withDirectory",
          args: { path, directory, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory plus the contents of the given file copied to the given path.
   * @param path Location of the copied file (e.g., "/file.txt").
   * @param source Identifier of the file to copy.
   * @param opts.permissions Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   */
  withFile(
    path: string,
    source: File,
    opts?: DirectoryWithFileOpts
  ): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withFile",
          args: { path, source, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory plus a new directory created at the given path.
   * @param path Location of the directory created (e.g., "/logs").
   * @param opts.permissions Permission granted to the created directory (e.g., 0777).
   *
   * Default: 0755.
   */
  withNewDirectory(
    path: string,
    opts?: DirectoryWithNewDirectoryOpts
  ): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withNewDirectory",
          args: { path, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory plus a new file written at the given path.
   * @param path Location of the written file (e.g., "/file.txt").
   * @param contents Content of the written file (e.g., "Hello world!").
   * @param opts.permissions Permission given to the copied file (e.g., 0600).
   *
   * Default: 0644.
   */
  withNewFile(
    path: string,
    contents: string,
    opts?: DirectoryWithNewFileOpts
  ): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withNewFile",
          args: { path, contents, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory with all file/dir timestamps set to the given time.
   * @param timestamp Timestamp to set dir/files in.
   *
   * Formatted in seconds following Unix epoch (e.g., 1672531199).
   */
  withTimestamps(timestamp: number): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withTimestamps",
          args: { timestamp },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory with the directory at the given path removed.
   * @param path Location of the directory to remove (e.g., ".github/").
   */
  withoutDirectory(path: string): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutDirectory",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Retrieves this directory with the file at the given path removed.
   * @param path Location of the file to remove (e.g., "/file.txt").
   */
  withoutFile(path: string): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutFile",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current Directory.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: Directory) => Directory) {
    return arg(this);
  }
}

/**
 * A simple key value object that represents an environment variable.
 */
export class EnvVariable extends BaseClient {
  private readonly _name?: string = undefined;
  private readonly _value?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _name?: string,
    _value?: string
  ) {
    super(parent);

    this._name = _name;
    this._value = _value;
  }

  /**
   * The environment variable name.
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The environment variable value.
   */
  async value(): Promise<string> {
    if (this._value) {
      return this._value;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "value",
        },
      ],
      this.client
    );

    return response;
  }
}

/**
 * A definition of a field on a custom object defined in a Module.
 * A field on an object has a static value, as opposed to a function on an
 * object whose value is computed by invoking code (and can accept arguments).
 */
export class FieldTypeDef extends BaseClient {
  private readonly _description?: string = undefined;
  private readonly _name?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _description?: string,
    _name?: string
  ) {
    super(parent);

    this._description = _description;
    this._name = _name;
  }

  /**
   * A doc string for the field, if any
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The name of the field in the object
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The type of the field
   */
  typeDef(): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "typeDef",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

/**
 * A file.
 */
export class File extends BaseClient {
  private readonly _id?: FileID = undefined;
  private readonly _contents?: string = undefined;
  private readonly _export?: boolean = undefined;
  private readonly _size?: number = undefined;
  private readonly _sync?: FileID = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: FileID,
    _contents?: string,
    _export?: boolean,
    _size?: number,
    _sync?: FileID
  ) {
    super(parent);

    this._id = _id;
    this._contents = _contents;
    this._export = _export;
    this._size = _size;
    this._sync = _sync;
  }

  /**
   * Retrieves the content-addressed identifier of the file.
   */
  async id(): Promise<FileID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<FileID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves the contents of the file.
   */
  async contents(): Promise<string> {
    if (this._contents) {
      return this._contents;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "contents",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Writes the file to a file path on the host.
   * @param path Location of the written directory (e.g., "output.txt").
   * @param opts.allowParentDirPath If allowParentDirPath is true, the path argument can be a directory path, in which case
   * the file will be created in that directory.
   */
  async export(path: string, opts?: FileExportOpts): Promise<boolean> {
    if (this._export) {
      return this._export;
    }

    const response: Awaited<boolean> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "export",
          args: { path, ...opts },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Gets the size of the file, in bytes.
   */
  async size(): Promise<number> {
    if (this._size) {
      return this._size;
    }

    const response: Awaited<number> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "size",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Force evaluation in the engine.
   */
  async sync(): Promise<File> {
    await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sync",
        },
      ],
      this.client
    );

    return this;
  }

  /**
   * Retrieves this file with its created/modified timestamps set to the given time.
   * @param timestamp Timestamp to set dir/files in.
   *
   * Formatted in seconds following Unix epoch (e.g., 1672531199).
   */
  withTimestamps(timestamp: number): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withTimestamps",
          args: { timestamp },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current File.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: File) => File) {
    return arg(this);
  }
}

/**
 * Function represents a resolver provided by a Module.
 *
 * A function always evaluates against a parent object and is given a set of
 * named arguments.
 */
export class Function_ extends BaseClient {
  private readonly _id?: FunctionID = undefined;
  private readonly _call?: JSON = undefined;
  private readonly _description?: string = undefined;
  private readonly _name?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: FunctionID,
    _call?: JSON,
    _description?: string,
    _name?: string
  ) {
    super(parent);

    this._id = _id;
    this._call = _call;
    this._description = _description;
    this._name = _name;
  }

  /**
   * The ID of the function
   */
  async id(): Promise<FunctionID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<FunctionID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Arguments accepted by this function, if any
   */
  async args(): Promise<FunctionArg[]> {
    type args = {
      id: FunctionArgID;
    };

    const response: Awaited<args[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "args",
        },
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new FunctionArg(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.id
        )
    );
  }

  /**
   * Execute this function using dynamic input+output types.
   *
   * Typically, it's preferable to invoke a function using a type
   * safe graphql query rather than using this call field. However,
   * call is useful for some advanced use cases where dynamically
   * loading arbitrary modules and invoking functions in them is
   * required.
   */
  async call(opts?: FunctionCallOpts): Promise<JSON> {
    if (this._call) {
      return this._call;
    }

    const response: Awaited<JSON> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "call",
          args: { ...opts },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * A doc string for the function, if any
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The name of the function
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The type returned by this function
   */
  returnType(): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "returnType",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns the function with the provided argument
   * @param name The name of the argument
   * @param typeDef The type of the argument
   * @param opts.description A doc string for the argument, if any
   * @param opts.defaultValue A default value to use for this argument if not explicitly set by the caller, if any
   */
  withArg(
    name: string,
    typeDef: TypeDef,
    opts?: FunctionWithArgOpts
  ): Function_ {
    return new Function_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withArg",
          args: { name, typeDef, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns the function with the doc string
   */
  withDescription(description: string): Function_ {
    return new Function_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withDescription",
          args: { description },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current Function.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: Function_) => Function_) {
    return arg(this);
  }
}

/**
 * An argument accepted by a function.
 *
 * This is a specification for an argument at function definition time, not an
 * argument passed at function call time.
 */
export class FunctionArg extends BaseClient {
  private readonly _id?: FunctionArgID = undefined;
  private readonly _defaultValue?: JSON = undefined;
  private readonly _description?: string = undefined;
  private readonly _name?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: FunctionArgID,
    _defaultValue?: JSON,
    _description?: string,
    _name?: string
  ) {
    super(parent);

    this._id = _id;
    this._defaultValue = _defaultValue;
    this._description = _description;
    this._name = _name;
  }

  /**
   * The ID of the argument
   */
  async id(): Promise<FunctionArgID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<FunctionArgID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * A default value to use for this argument when not explicitly set by the caller, if any
   */
  async defaultValue(): Promise<JSON> {
    if (this._defaultValue) {
      return this._defaultValue;
    }

    const response: Awaited<JSON> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "defaultValue",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * A doc string for the argument, if any
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The name of the argument
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The type of the argument
   */
  typeDef(): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "typeDef",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

export class FunctionCall extends BaseClient {
  private readonly _name?: string = undefined;
  private readonly _parent?: JSON = undefined;
  private readonly _parentName?: string = undefined;
  private readonly _returnValue?: Void = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _name?: string,
    _parent?: JSON,
    _parentName?: string,
    _returnValue?: Void
  ) {
    super(parent);

    this._name = _name;
    this._parent = _parent;
    this._parentName = _parentName;
    this._returnValue = _returnValue;
  }

  /**
   * The argument values the function is being invoked with.
   */
  async inputArgs(): Promise<FunctionCallArgValue[]> {
    type inputArgs = {
      name: string;
      value: JSON;
    };

    const response: Awaited<inputArgs[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "inputArgs",
        },
        {
          operation: "name value",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new FunctionCallArgValue(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.name,
          r.value
        )
    );
  }

  /**
   * The name of the function being called.
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The value of the parent object of the function being called.
   * If the function is "top-level" to the module, this is always an empty object.
   */
  async parent(): Promise<JSON> {
    if (this._parent) {
      return this._parent;
    }

    const response: Awaited<JSON> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "parent",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The name of the parent object of the function being called.
   * If the function is "top-level" to the module, this is the name of the module.
   */
  async parentName(): Promise<string> {
    if (this._parentName) {
      return this._parentName;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "parentName",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Set the return value of the function call to the provided value.
   * The value should be a string of the JSON serialization of the return value.
   */
  async returnValue(value: JSON): Promise<Void> {
    if (this._returnValue) {
      return this._returnValue;
    }

    const response: Awaited<Void> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "returnValue",
          args: { value },
        },
      ],
      this.client
    );

    return response;
  }
}

export class FunctionCallArgValue extends BaseClient {
  private readonly _name?: string = undefined;
  private readonly _value?: JSON = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _name?: string,
    _value?: JSON
  ) {
    super(parent);

    this._name = _name;
    this._value = _value;
  }

  /**
   * The name of the argument.
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The value of the argument represented as a string of the JSON serialization.
   */
  async value(): Promise<JSON> {
    if (this._value) {
      return this._value;
    }

    const response: Awaited<JSON> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "value",
        },
      ],
      this.client
    );

    return response;
  }
}

export class GeneratedCode extends BaseClient {
  private readonly _id?: GeneratedCodeID = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: GeneratedCodeID
  ) {
    super(parent);

    this._id = _id;
  }
  async id(): Promise<GeneratedCodeID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<GeneratedCodeID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The directory containing the generated code
   */
  code(): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "code",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * List of paths to mark generated in version control (i.e. .gitattributes)
   */
  async vcsGeneratedPaths(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "vcsGeneratedPaths",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * List of paths to ignore in version control (i.e. .gitignore)
   */
  async vcsIgnoredPaths(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "vcsIgnoredPaths",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Set the list of paths to mark generated in version control
   */
  withVCSGeneratedPaths(paths: string[]): GeneratedCode {
    return new GeneratedCode({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withVCSGeneratedPaths",
          args: { paths },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Set the list of paths to ignore in version control
   */
  withVCSIgnoredPaths(paths: string[]): GeneratedCode {
    return new GeneratedCode({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withVCSIgnoredPaths",
          args: { paths },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current GeneratedCode.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: GeneratedCode) => GeneratedCode) {
    return arg(this);
  }
}

/**
 * A git ref (tag, branch or commit).
 */
export class GitRef extends BaseClient {
  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(parent?: {
    queryTree?: QueryTree[];
    host?: string;
    sessionToken?: string;
  }) {
    super(parent);
  }

  /**
   * The filesystem tree at this ref.
   */
  tree(opts?: GitRefTreeOpts): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "tree",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

/**
 * A git repository.
 */
export class GitRepository extends BaseClient {
  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(parent?: {
    queryTree?: QueryTree[];
    host?: string;
    sessionToken?: string;
  }) {
    super(parent);
  }

  /**
   * Returns details on one branch.
   * @param name Branch's name (e.g., "main").
   */
  branch(name: string): GitRef {
    return new GitRef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "branch",
          args: { name },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns details on one commit.
   * @param id Identifier of the commit (e.g., "b6315d8f2810962c601af73f86831f6866ea798b").
   */
  commit(id: string): GitRef {
    return new GitRef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "commit",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns details on one tag.
   * @param name Tag's name (e.g., "v0.3.9").
   */
  tag(name: string): GitRef {
    return new GitRef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "tag",
          args: { name },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

/**
 * Information about the host execution environment.
 */
export class Host extends BaseClient {
  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(parent?: {
    queryTree?: QueryTree[];
    host?: string;
    sessionToken?: string;
  }) {
    super(parent);
  }

  /**
   * Accesses a directory on the host.
   * @param path Location of the directory to access (e.g., ".").
   * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
   * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
   */
  directory(path: string, opts?: HostDirectoryOpts): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "directory",
          args: { path, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Accesses a file on the host.
   * @param path Location of the file to retrieve (e.g., "README.md").
   */
  file(path: string): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "file",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Sets a secret given a user-defined name and the file path on the host, and returns the secret.
   * The file is limited to a size of 512000 bytes.
   * @param name The user defined name for this secret.
   * @param path Location of the file to set as a secret.
   */
  setSecretFile(name: string, path: string): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "setSecretFile",
          args: { name, path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Accesses a Unix socket on the host.
   * @param path Location of the Unix socket (e.g., "/var/run/docker.sock").
   */
  unixSocket(path: string): Socket {
    return new Socket({
      queryTree: [
        ...this._queryTree,
        {
          operation: "unixSocket",
          args: { path },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

/**
 * A simple key value object that represents a label.
 */
export class Label extends BaseClient {
  private readonly _name?: string = undefined;
  private readonly _value?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _name?: string,
    _value?: string
  ) {
    super(parent);

    this._name = _name;
    this._value = _value;
  }

  /**
   * The label name.
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The label value.
   */
  async value(): Promise<string> {
    if (this._value) {
      return this._value;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "value",
        },
      ],
      this.client
    );

    return response;
  }
}

/**
 * A definition of a list type in a Module.
 */
export class ListTypeDef extends BaseClient {
  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(parent?: {
    queryTree?: QueryTree[];
    host?: string;
    sessionToken?: string;
  }) {
    super(parent);
  }

  /**
   * The type of the elements in the list
   */
  elementTypeDef(): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "elementTypeDef",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }
}

export class Module_ extends BaseClient {
  private readonly _id?: ModuleID = undefined;
  private readonly _description?: string = undefined;
  private readonly _name?: string = undefined;
  private readonly _sdk?: string = undefined;
  private readonly _sdkRuntime?: string = undefined;
  private readonly _serve?: Void = undefined;
  private readonly _sourceDirectorySubPath?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: ModuleID,
    _description?: string,
    _name?: string,
    _sdk?: string,
    _sdkRuntime?: string,
    _serve?: Void,
    _sourceDirectorySubPath?: string
  ) {
    super(parent);

    this._id = _id;
    this._description = _description;
    this._name = _name;
    this._sdk = _sdk;
    this._sdkRuntime = _sdkRuntime;
    this._serve = _serve;
    this._sourceDirectorySubPath = _sourceDirectorySubPath;
  }

  /**
   * The ID of the module
   */
  async id(): Promise<ModuleID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<ModuleID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Modules used by this module
   */
  async dependencies(): Promise<Module_[]> {
    type dependencies = {
      id: ModuleID;
    };

    const response: Awaited<dependencies[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "dependencies",
        },
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new Module_(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.id
        )
    );
  }

  /**
   * The dependencies as configured by the module
   */
  async dependencyConfig(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "dependencyConfig",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The doc string of the module, if any
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The code generated by the SDK's runtime
   */
  generatedCode(): GeneratedCode {
    return new GeneratedCode({
      queryTree: [
        ...this._queryTree,
        {
          operation: "generatedCode",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The name of the module
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Objects served by this module
   */
  async objects(): Promise<TypeDef[]> {
    type objects = {
      id: TypeDefID;
    };

    const response: Awaited<objects[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "objects",
        },
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new TypeDef(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.id
        )
    );
  }

  /**
   * The SDK used by this module
   */
  async sdk(): Promise<string> {
    if (this._sdk) {
      return this._sdk;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sdk",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The SDK runtime module image ref.
   */
  async sdkRuntime(): Promise<string> {
    if (this._sdkRuntime) {
      return this._sdkRuntime;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sdkRuntime",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Serve a module's API in the current session.
   *     Note: this can only be called once per session.
   *     In the future, it could return a stream or service to remove the side effect.
   */
  async serve(opts?: ModuleServeOpts): Promise<Void> {
    if (this._serve) {
      return this._serve;
    }

    const response: Awaited<Void> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "serve",
          args: { ...opts },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The directory containing the module's source code
   */
  sourceDirectory(): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "sourceDirectory",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The module's subpath within the source directory
   */
  async sourceDirectorySubPath(): Promise<string> {
    if (this._sourceDirectorySubPath) {
      return this._sourceDirectorySubPath;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "sourceDirectorySubPath",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * This module plus the given Object type and associated functions
   */
  withObject(object: TypeDef): Module_ {
    return new Module_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withObject",
          args: { object },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current Module.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: Module_) => Module_) {
    return arg(this);
  }
}

/**
 * A definition of a custom object defined in a Module.
 */
export class ObjectTypeDef extends BaseClient {
  private readonly _description?: string = undefined;
  private readonly _name?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _description?: string,
    _name?: string
  ) {
    super(parent);

    this._description = _description;
    this._name = _name;
  }

  /**
   * The doc string for the object, if any
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Static fields defined on this object, if any
   */
  async fields(): Promise<FieldTypeDef[]> {
    type fields = {
      description: string;
      name: string;
    };

    const response: Awaited<fields[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "fields",
        },
        {
          operation: "description name",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new FieldTypeDef(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.description,
          r.name
        )
    );
  }

  /**
   * Functions defined on this object, if any
   */
  async functions(): Promise<Function_[]> {
    type functions = {
      id: FunctionID;
    };

    const response: Awaited<functions[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "functions",
        },
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response.map(
      (r) =>
        new Function_(
          {
            queryTree: this.queryTree,
            host: this.clientHost,
            sessionToken: this.sessionToken,
          },
          r.id
        )
    );
  }

  /**
   * The name of the object
   */
  async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "name",
        },
      ],
      this.client
    );

    return response;
  }
}

/**
 * A port exposed by a container.
 */
export class Port extends BaseClient {
  private readonly _description?: string = undefined;
  private readonly _port?: number = undefined;
  private readonly _protocol?: NetworkProtocol = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _description?: string,
    _port?: number,
    _protocol?: NetworkProtocol
  ) {
    super(parent);

    this._description = _description;
    this._port = _port;
    this._protocol = _protocol;
  }

  /**
   * The port description.
   */
  async description(): Promise<string> {
    if (this._description) {
      return this._description;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "description",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The port number.
   */
  async port(): Promise<number> {
    if (this._port) {
      return this._port;
    }

    const response: Awaited<number> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "port",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The transport layer network protocol.
   */
  async protocol(): Promise<NetworkProtocol> {
    if (this._protocol) {
      return this._protocol;
    }

    const response: Awaited<NetworkProtocol> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "protocol",
        },
      ],
      this.client
    );

    return response;
  }
}

export class Client extends BaseClient {
  private readonly _checkVersionCompatibility?: boolean = undefined;
  private readonly _defaultPlatform?: Platform = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _checkVersionCompatibility?: boolean,
    _defaultPlatform?: Platform
  ) {
    super(parent);

    this._checkVersionCompatibility = _checkVersionCompatibility;
    this._defaultPlatform = _defaultPlatform;
  }

  /**
   * Constructs a cache volume for a given cache key.
   * @param key A string identifier to target this cache volume (e.g., "modules-cache").
   */
  cacheVolume(key: string): CacheVolume {
    return new CacheVolume({
      queryTree: [
        ...this._queryTree,
        {
          operation: "cacheVolume",
          args: { key },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Checks if the current Dagger Engine is compatible with an SDK's required version.
   * @param version The SDK's required version.
   */
  async checkVersionCompatibility(version: string): Promise<boolean> {
    const response: Awaited<boolean> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "checkVersionCompatibility",
          args: { version },
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Creates a scratch container or loads one by ID.
   *
   * Optional platform argument initializes new containers to execute and publish
   * as that platform. Platform defaults to that of the builder's host.
   */
  container(opts?: ClientContainerOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "container",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The FunctionCall context that the SDK caller is currently executing in.
   * If the caller is not currently executing in a function, this will return
   * an error.
   */
  currentFunctionCall(): FunctionCall {
    return new FunctionCall({
      queryTree: [
        ...this._queryTree,
        {
          operation: "currentFunctionCall",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The module currently being served in the session, if any.
   */
  currentModule(): Module_ {
    return new Module_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "currentModule",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The default platform of the builder.
   */
  async defaultPlatform(): Promise<Platform> {
    const response: Awaited<Platform> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "defaultPlatform",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Creates an empty directory or loads one by ID.
   */
  directory(opts?: ClientDirectoryOpts): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "directory",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Loads a file by ID.
   * @deprecated Use loadFileFromID instead.
   */
  file(id: FileID): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "file",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Create a function.
   */
  function_(name: string, returnType: TypeDef): Function_ {
    return new Function_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "function",
          args: { name, returnType },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Create a code generation result, given a directory containing the generated
   * code.
   */
  generatedCode(code: Directory): GeneratedCode {
    return new GeneratedCode({
      queryTree: [
        ...this._queryTree,
        {
          operation: "generatedCode",
          args: { code },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Queries a git repository.
   * @param url Url of the git repository.
   * Can be formatted as https://{host}/{owner}/{repo}, git@{host}/{owner}/{repo}
   * Suffix ".git" is optional.
   * @param opts.keepGitDir Set to true to keep .git directory.
   * @param opts.experimentalServiceHost A service which must be started before the repo is fetched.
   */
  git(url: string, opts?: ClientGitOpts): GitRepository {
    return new GitRepository({
      queryTree: [
        ...this._queryTree,
        {
          operation: "git",
          args: { url, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Queries the host environment.
   */
  host(): Host {
    return new Host({
      queryTree: [
        ...this._queryTree,
        {
          operation: "host",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns a file containing an http remote url content.
   * @param url HTTP url to get the content from (e.g., "https://docs.dagger.io").
   * @param opts.experimentalServiceHost A service which must be started before the URL is fetched.
   */
  http(url: string, opts?: ClientHttpOpts): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "http",
          args: { url, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a CacheVolume from its ID.
   */
  loadCacheVolumeFromID(id: CacheVolumeID): CacheVolume {
    return new CacheVolume({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadCacheVolumeFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Loads a container from an ID.
   */
  loadContainerFromID(id: ContainerID): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadContainerFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a Directory from its ID.
   */
  loadDirectoryFromID(id: DirectoryID): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadDirectoryFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a File from its ID.
   */
  loadFileFromID(id: FileID): File {
    return new File({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadFileFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a function argument by ID.
   */
  loadFunctionArgFromID(id: FunctionArgID): FunctionArg {
    return new FunctionArg({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadFunctionArgFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a function by ID.
   */
  loadFunctionFromID(id: FunctionID): Function_ {
    return new Function_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadFunctionFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a GeneratedCode by ID.
   */
  loadGeneratedCodeFromID(id: GeneratedCodeID): GeneratedCode {
    return new GeneratedCode({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadGeneratedCodeFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a module by ID.
   */
  loadModuleFromID(id: ModuleID): Module_ {
    return new Module_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadModuleFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a Secret from its ID.
   */
  loadSecretFromID(id: SecretID): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadSecretFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a Socket from its ID.
   */
  loadSocketFromID(id: SocketID): Socket {
    return new Socket({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadSocketFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a TypeDef by ID.
   */
  loadTypeDefFromID(id: TypeDefID): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "loadTypeDefFromID",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Create a new module.
   */
  module_(): Module_ {
    return new Module_({
      queryTree: [
        ...this._queryTree,
        {
          operation: "module",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Creates a named sub-pipeline.
   * @param name Pipeline name.
   * @param opts.description Pipeline description.
   * @param opts.labels Pipeline labels.
   */
  pipeline(name: string, opts?: ClientPipelineOpts): Client {
    return new Client({
      queryTree: [
        ...this._queryTree,
        {
          operation: "pipeline",
          args: { name, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Loads a secret from its ID.
   * @deprecated Use loadSecretFromID instead
   */
  secret(id: SecretID): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "secret",
          args: { id },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Sets a secret given a user defined name to its plaintext and returns the secret.
   * The plaintext value is limited to a size of 128000 bytes.
   * @param name The user defined name for this secret
   * @param plaintext The plaintext of the secret
   */
  setSecret(name: string, plaintext: string): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "setSecret",
          args: { name, plaintext },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Loads a socket by its ID.
   * @deprecated Use loadSocketFromID instead.
   */
  socket(opts?: ClientSocketOpts): Socket {
    return new Socket({
      queryTree: [
        ...this._queryTree,
        {
          operation: "socket",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Create a new TypeDef.
   */
  typeDef(): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "typeDef",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current Client.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: Client) => Client) {
    return arg(this);
  }
}

/**
 * A reference to a secret value, which can be handled more safely than the value itself.
 */
export class Secret extends BaseClient {
  private readonly _id?: SecretID = undefined;
  private readonly _plaintext?: string = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: SecretID,
    _plaintext?: string
  ) {
    super(parent);

    this._id = _id;
    this._plaintext = _plaintext;
  }

  /**
   * The identifier for this secret.
   */
  async id(): Promise<SecretID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<SecretID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * The value of this secret.
   */
  async plaintext(): Promise<string> {
    if (this._plaintext) {
      return this._plaintext;
    }

    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "plaintext",
        },
      ],
      this.client
    );

    return response;
  }
}

export class Socket extends BaseClient {
  private readonly _id?: SocketID = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: SocketID
  ) {
    super(parent);

    this._id = _id;
  }

  /**
   * The content-addressed identifier of the socket.
   */
  async id(): Promise<SocketID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<SocketID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }
}

/**
 * A definition of a parameter or return type in a Module.
 */
export class TypeDef extends BaseClient {
  private readonly _id?: TypeDefID = undefined;
  private readonly _kind?: TypeDefKind = undefined;
  private readonly _optional?: boolean = undefined;

  /**
   * Constructor is used for internal usage only, do not create object from it.
   */
  constructor(
    parent?: { queryTree?: QueryTree[]; host?: string; sessionToken?: string },
    _id?: TypeDefID,
    _kind?: TypeDefKind,
    _optional?: boolean
  ) {
    super(parent);

    this._id = _id;
    this._kind = _kind;
    this._optional = _optional;
  }
  async id(): Promise<TypeDefID> {
    if (this._id) {
      return this._id;
    }

    const response: Awaited<TypeDefID> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "id",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * If kind is LIST, the list-specific type definition.
   * If kind is not LIST, this will be null.
   */
  asList(): ListTypeDef {
    return new ListTypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "asList",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * If kind is OBJECT, the object-specific type definition.
   * If kind is not OBJECT, this will be null.
   */
  asObject(): ObjectTypeDef {
    return new ObjectTypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "asObject",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The kind of type this is (e.g. primitive, list, object)
   */
  async kind(): Promise<TypeDefKind> {
    if (this._kind) {
      return this._kind;
    }

    const response: Awaited<TypeDefKind> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "kind",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Whether this type can be set to null. Defaults to false.
   */
  async optional(): Promise<boolean> {
    if (this._optional) {
      return this._optional;
    }

    const response: Awaited<boolean> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "optional",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Adds a static field for an Object TypeDef, failing if the type is not an object.
   * @param name The name of the field in the object
   * @param typeDef The type of the field
   * @param opts.description A doc string for the field, if any
   */
  withField(
    name: string,
    typeDef: TypeDef,
    opts?: TypeDefWithFieldOpts
  ): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withField",
          args: { name, typeDef, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Adds a function for an Object TypeDef, failing if the type is not an object.
   */
  withFunction(function_: Function_): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withFunction",
          args: { function_ },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Sets the kind of the type.
   */
  withKind(kind: TypeDefKind): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withKind",
          args: { kind },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns a TypeDef of kind List with the provided type for its elements.
   */
  withListOf(elementType: TypeDef): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withListOf",
          args: { elementType },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Returns a TypeDef of kind Object with the provided name.
   *
   * Note that an object's fields and functions may be omitted if the intent is
   * only to refer to an object. This is how functions are able to return their
   * own object, or any other circular reference.
   */
  withObject(name: string, opts?: TypeDefWithObjectOpts): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withObject",
          args: { name, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Sets whether this type can be set to null.
   */
  withOptional(optional: boolean): TypeDef {
    return new TypeDef({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withOptional",
          args: { optional },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Call the provided function with current TypeDef.
   *
   * This is useful for reusability and readability by not breaking the calling chain.
   */
  with(arg: (param: TypeDef) => TypeDef) {
    return arg(this);
  }
}
