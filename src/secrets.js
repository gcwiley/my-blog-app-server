import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// create the secret manager client
const client = new SecretManagerServiceClient();

// get the secret value from Google Secret Manager
export async function getSecret(secretName, version = 'latest') {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  // ensure the project ID is available to prevent constructing an invalid resource name
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set.');
  }

  // construct the full resource name for the secret version
  const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;

  // access the secret version and retrieve the payload
  const [response] = await client.accessSecretVersion({ name });
  return response.payload.data.toString('utf8');
}

// load all required secrets into process.env
export async function loadSecrets() {
  if (process.env.NODE_ENV === 'production' || process.env.GAE_ENV) {
    process.env.DB_NAME = await getSecret('DB_NAME');
    process.env.DB_USER = await getSecret('DB_USER');
    process.env.DB_PASSWORD = await getSecret('DB_PASSWORD');
    process.env.CLOUD_SQL_CONNECTION_NAME = await getSecret(
      'CLOUD_SQL_CONNECTION_NAME'
    );
    process.env.CORS_ORIGIN = await getSecret('CORS_ORIGIN');
    console.log('Secret loaded from Google Secret Manager.');
  } else {
    console.log('Using local .env file for secrets.');
  }
}
