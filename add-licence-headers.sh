#! /bin/sh
# Copyright 2022 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     https://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

YEAR=$(date +%Y)
DIR=$(dirname $0)
LICENSE_HEADERS_DIR="$DIR/license-headers"
FILES_LIST=$(find $DIR -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.*/*" \
    -not -path "license-headers/*" \
    -not -name ".*"
)

get_license_by_extension() {
    EXTENSION=$(echo $1 | rev | cut -d'.' -f1 | rev)
    LICENSE_FILE="${LICENSE_HEADERS_DIR}/${EXTENSION}"
    if [ -e "$LICENSE_FILE" ]; then
        cat $LICENSE_FILE | sed "s/{{YEAR}}/$YEAR/"
    fi
}

add_license_to_file() {
    FILE=$1
    LICENSE=$2
    TMP_FILE=/tmp/licensed-file.$$
    (echo "$LICENSE"; echo; cat $FILE) > $TMP_FILE
    mv $TMP_FILE $FILE
}

FILE_COUNT=0
for FILE in $FILES_LIST; do
    LICENSE_HEADER=$(get_license_by_extension $FILE)
    if [ -n "$LICENSE_HEADER" ]; then
        LICENSE_HEADER_LENGTH=$(echo "$LICENSE_HEADER" | wc -l | xargs)
        FILE_HEAD=$(head -n $LICENSE_HEADER_LENGTH $FILE)
        if [ "$FILE_HEAD" != "$LICENSE_HEADER" ]; then
            add_license_to_file "$FILE" "$LICENSE_HEADER"
            FILE_COUNT=$((FILE_COUNT+1))
        fi
    fi
done
echo "License header added to $FILE_COUNT file(s)."