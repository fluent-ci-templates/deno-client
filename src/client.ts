import { GraphQLClient } from "../deps.ts";

import { computeQuery } from "./utils.ts";

/**
 * @hidden
 */
export type QueryTree = {
  operation: string;
  args?: Record<string, unknown>;
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
 * A global cache volume identifier.
 */
export type CacheID = string & { __CacheID: never };

/**
 * Sharing mode of the cache volume.
 */
export enum CacheSharingMode {
  /**
   * Shares the cache volume amongst many build pipelines,
   * but will serialize the writes
   */
  Locked,

  /**
   * Keeps a cache volume for a single build pipeline
   */
  Private,

  /**
   * Shares the cache volume amongst many build pipelines
   */
  Shared,
}
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
   * They will be mounted at /run/secrets/[secret-name].
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

export type ContainerExecOpts = {
  /**
   * Command to run instead of the container's default command (e.g., ["run", "main.go"]).
   */
  args?: string[];

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
   * Provide dagger access to the executed command.
   * Do not use this option unless you trust the command being executed.
   * The command being executed WILL BE GRANTED FULL ACCESS TO YOUR HOST FILESYSTEM.
   */
  experimentalPrivilegedNesting?: boolean;
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

/**
 * A file identifier.
 */
export type FileID = string & { __FileID: never };

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

export type HostWorkdirOpts = {
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
 * Compression algorithm to use for image layers
 */
export enum ImageLayerCompression {
  Estargz,
  Gzip,
  Uncompressed,
  Zstd,
}
/**
 * Transport layer network protocol associated to a port.
 */
export enum NetworkProtocol {
  /**
   * TCP (Transmission Control Protocol)
   */
  Tcp,

  /**
   * UDP (User Datagram Protocol)
   */
  Udp,
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

/**
 * A unique project command identifier.
 */
export type ProjectCommandID = string & { __ProjectCommandID: never };

/**
 * A unique project identifier.
 */
export type ProjectID = string & { __ProjectID: never };

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

export type ClientProjectOpts = {
  id?: ProjectID;
};

export type ClientProjectCommandOpts = {
  id?: ProjectCommandID;
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
  async id(): Promise<CacheID> {
    const response: Awaited<CacheID> = await computeQuery(
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: CacheVolume) => CacheVolume) {
    return arg(this);
  }
}

/**
 * An OCI-compatible container, also known as a docker container.
 */

export class Container extends BaseClient {
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
   * They will be mounted at /run/secrets/[secret-name].
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
    const response: Awaited<EnvVariable[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "envVariables",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Retrieves this container after executing the specified command inside it.
   * @param opts.args Command to run instead of the container's default command (e.g., ["run", "main.go"]).
   * @param opts.stdin Content to write to the command's standard input before closing (e.g., "Hello world").
   * @param opts.redirectStdout Redirect the command's standard output to a file in the container (e.g., "/tmp/stdout").
   * @param opts.redirectStderr Redirect the command's standard error to a file in the container (e.g., "/tmp/stderr").
   * @param opts.experimentalPrivilegedNesting Provide dagger access to the executed command.
   * Do not use this option unless you trust the command being executed.
   * The command being executed WILL BE GRANTED FULL ACCESS TO YOUR HOST FILESYSTEM.
   * @deprecated Replaced by withExec.
   */
  exec(opts?: ContainerExecOpts): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "exec",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Exit code of the last executed command. Zero means success.
   *
   * Will execute default command if none is set, or error if there's no default.
   */
  async exitCode(): Promise<number> {
    const response: Awaited<number> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "exitCode",
        },
      ],
      this.client
    );

    return response;
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
   */
  async export(path: string, opts?: ContainerExportOpts): Promise<boolean> {
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
   * Retrieves the list of exposed ports.
   *
   * Currently experimental; set _EXPERIMENTAL_DAGGER_SERVICES_DNS=0 to disable.
   */
  async exposedPorts(): Promise<Port[]> {
    const response: Awaited<Port[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "exposedPorts",
        },
      ],
      this.client
    );

    return response;
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
   * Retrieves this container's root filesystem. Mounts are not included.
   * @deprecated Replaced by rootfs.
   */
  fs(): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "fs",
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
   * A unique identifier for this container.
   */
  async id(): Promise<ContainerID> {
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
   * The unique image reference which can only be retrieved immediately after the 'Container.From' call.
   */
  async imageRef(): Promise<string> {
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
  import(source: File, opts?: ContainerImportOpts): Container {
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
    const response: Awaited<Label[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "labels",
        },
      ],
      this.client
    );

    return response;
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
   */
  async publish(address: string, opts?: ContainerPublishOpts): Promise<string> {
    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "publish",
          args: { address, ...opts },
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
   * The error stream of the last executed command.
   *
   * Will execute default command if none is set, or error if there's no default.
   */
  async stderr(): Promise<string> {
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
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withExposedPort",
          args: { port, ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Initializes this container from this DirectoryID.
   * @deprecated Replaced by withRootfs.
   */
  withFS(id: Directory): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withFS",
          args: { id },
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
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withMountedCache",
          args: { path, cache, ...opts },
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
  withRootfs(id: Directory): Container {
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withRootfs",
          args: { id },
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
    return new Container({
      queryTree: [
        ...this._queryTree,
        {
          operation: "withoutExposedPort",
          args: { port, ...opts },
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Container) => Container) {
    return arg(this);
  }
}

/**
 * A directory.
 */

export class Directory extends BaseClient {
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
   * The content-addressed identifier of the directory.
   */
  async id(): Promise<DirectoryID> {
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Directory) => Directory) {
    return arg(this);
  }
}

/**
 * A simple key value object that represents an environment variable.
 */

export class EnvVariable extends BaseClient {
  /**
   * The environment variable name.
   */
  async name(): Promise<string> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: EnvVariable) => EnvVariable) {
    return arg(this);
  }
}

/**
 * A file.
 */

export class File extends BaseClient {
  /**
   * Retrieves the contents of the file.
   */
  async contents(): Promise<string> {
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
   */
  async export(path: string): Promise<boolean> {
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
   * Retrieves the content-addressed identifier of the file.
   */
  async id(): Promise<FileID> {
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
   * Retrieves a secret referencing the contents of this file.
   * @deprecated insecure, leaves secret in cache. Superseded by setSecret
   */
  secret(): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "secret",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Gets the size of the file, in bytes.
   */
  async size(): Promise<number> {
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: File) => File) {
    return arg(this);
  }
}

/**
 * A git ref (tag, branch or commit).
 */

export class GitRef extends BaseClient {
  /**
   * The digest of the current value of this ref.
   */
  async digest(): Promise<string> {
    const response: Awaited<string> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "digest",
        },
      ],
      this.client
    );

    return response;
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: GitRef) => GitRef) {
    return arg(this);
  }
}

/**
 * A git repository.
 */

export class GitRepository extends BaseClient {
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
   * Lists of branches on the repository.
   */
  async branches(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "branches",
        },
      ],
      this.client
    );

    return response;
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

  /**
   * Lists of tags on the repository.
   */
  async tags(): Promise<string[]> {
    const response: Awaited<string[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "tags",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: GitRepository) => GitRepository) {
    return arg(this);
  }
}

/**
 * Information about the host execution environment.
 */

export class Host extends BaseClient {
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
   * Accesses an environment variable on the host.
   * @param name Name of the environment variable (e.g., "PATH").
   */
  envVariable(name: string): HostVariable {
    return new HostVariable({
      queryTree: [
        ...this._queryTree,
        {
          operation: "envVariable",
          args: { name },
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

  /**
   * Retrieves the current working directory on the host.
   * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
   * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
   * @deprecated Use directory with path set to '.' instead.
   */
  workdir(opts?: HostWorkdirOpts): Directory {
    return new Directory({
      queryTree: [
        ...this._queryTree,
        {
          operation: "workdir",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Host) => Host) {
    return arg(this);
  }
}

/**
 * An environment variable on the host environment.
 */

export class HostVariable extends BaseClient {
  /**
   * A secret referencing the value of this variable.
   * @deprecated been superseded by setSecret
   */
  secret(): Secret {
    return new Secret({
      queryTree: [
        ...this._queryTree,
        {
          operation: "secret",
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * The value of this variable.
   */
  async value(): Promise<string> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: HostVariable) => HostVariable) {
    return arg(this);
  }
}

/**
 * A simple key value object that represents a label.
 */

export class Label extends BaseClient {
  /**
   * The label name.
   */
  async name(): Promise<string> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Label) => Label) {
    return arg(this);
  }
}

/**
 * A port exposed by a container.
 */

export class Port extends BaseClient {
  /**
   * The port description.
   */
  async description(): Promise<string> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Port) => Port) {
    return arg(this);
  }
}

/**
 * A collection of Dagger resources that can be queried and invoked.
 */

export class Project extends BaseClient {
  /**
   * Commands provided by this project
   */
  async commands(): Promise<ProjectCommand[]> {
    const response: Awaited<ProjectCommand[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "commands",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * A unique identifier for this project.
   */
  async id(): Promise<string> {
    const response: Awaited<string> = await computeQuery(
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
   * Initialize this project from the given directory and config path
   */
  load(source: Directory, configPath: string): Project {
    return new Project({
      queryTree: [
        ...this._queryTree,
        {
          operation: "load",
          args: { source, configPath },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Name of the project
   */
  async name(): Promise<string> {
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Project) => Project) {
    return arg(this);
  }
}

/**
 * A command defined in a project that can be invoked from the CLI.
 */

export class ProjectCommand extends BaseClient {
  /**
   * Documentation for what this command does.
   */
  async description(): Promise<string> {
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
   * Flags accepted by this command.
   */
  async flags(): Promise<ProjectCommandFlag[]> {
    const response: Awaited<ProjectCommandFlag[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "flags",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * A unique identifier for this command.
   */
  async id(): Promise<string> {
    const response: Awaited<string> = await computeQuery(
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
   * The name of the command.
   */
  async name(): Promise<string> {
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
   * Subcommands, if any, that this command provides.
   */
  async subcommands(): Promise<ProjectCommand[]> {
    const response: Awaited<ProjectCommand[]> = await computeQuery(
      [
        ...this._queryTree,
        {
          operation: "subcommands",
        },
      ],
      this.client
    );

    return response;
  }

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: ProjectCommand) => ProjectCommand) {
    return arg(this);
  }
}

/**
 * A flag accepted by a project command.
 */

export class ProjectCommandFlag extends BaseClient {
  /**
   * Documentation for what this flag sets.
   */
  async description(): Promise<string> {
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
   * The name of the flag.
   */
  async name(): Promise<string> {
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
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: ProjectCommandFlag) => ProjectCommandFlag) {
    return arg(this);
  }
}

export default class Client extends BaseClient {
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
   * Loads a container from ID.
   *
   * Null ID returns an empty container (scratch).
   * Optional platform argument initializes new containers to execute and publish as that platform.
   * Platform defaults to that of the builder's host.
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
   * Load a directory by ID. No argument produces an empty directory.
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
   * Load a project from ID.
   */
  project(opts?: ClientProjectOpts): Project {
    return new Project({
      queryTree: [
        ...this._queryTree,
        {
          operation: "project",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Load a project command from ID.
   */
  projectCommand(opts?: ClientProjectCommandOpts): ProjectCommand {
    return new ProjectCommand({
      queryTree: [
        ...this._queryTree,
        {
          operation: "projectCommand",
          args: { ...opts },
        },
      ],
      host: this.clientHost,
      sessionToken: this.sessionToken,
    });
  }

  /**
   * Loads a secret from its ID.
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
}

/**
 * A reference to a secret value, which can be handled more safely than the value itself.
 */

export class Secret extends BaseClient {
  /**
   * The identifier for this secret.
   */
  async id(): Promise<SecretID> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Secret) => Secret) {
    return arg(this);
  }
}

export class Socket extends BaseClient {
  /**
   * The content-addressed identifier of the socket.
   */
  async id(): Promise<SocketID> {
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

  /**
   * Chain objects together
   * @example
   * ```ts
   *	function AddAFewMounts(c) {
   *			return c
   *			.withMountedDirectory("/foo", new Client().host().directory("/Users/slumbering/forks/dagger"))
   *			.withMountedDirectory("/bar", new Client().host().directory("/Users/slumbering/forks/dagger/sdk/nodejs"))
   *	}
   *
   * connect(async (client) => {
   *		const tree = await client
   *			.container()
   *			.from("alpine")
   *			.withWorkdir("/foo")
   *			.with(AddAFewMounts)
   *			.withExec(["ls", "-lh"])
   *			.stdout()
   * })
   *```
   */
  with(arg: (param: Socket) => Socket) {
    return arg(this);
  }
}
