#!/bin/bash

# Compress
tar -jcf ./environments/env_data.tar ./environments/env_data

# Encrypt
openssl enc -aes-256-cbc -md md5 -a -in ./environments/env_data.tar -out ./encrypted/env_data.tar.enc -pass env:AUTOMATION_ENC_PASS

# Remove .tar files
rm ./environments/env_data.tar
