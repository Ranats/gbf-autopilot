import json
import os
from base64 import b64encode
from OpenSSL import crypto

def main():
    dirname = os.path.dirname(__file__)
    manifest_path = os.path.join(dirname, 'extension/manifest.json')

    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, 2048)
    dumped = crypto.dump_privatekey(crypto.FILETYPE_ASN1, key)
    encoded = b64encode(dumped)

    manifest = None
    with open(manifest_path) as f:
        manifest = json.load(f)

    manifest['key'] = encoded.decode('utf-8')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

if __name__ == '__main__':
    main()
