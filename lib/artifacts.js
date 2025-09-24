// Export the contract artifacts
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON file directly
const artifactPath = join(__dirname, '../artifacts/contracts/IdentityShapeshifter.sol/IdentityShapeshifter.json');
const artifactContent = readFileSync(artifactPath, 'utf8');
const shapeshifterArtifact = JSON.parse(artifactContent);

export default shapeshifterArtifact;
