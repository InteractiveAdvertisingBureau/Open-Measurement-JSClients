#!/bin/bash

set -x

tgt="templates/umd-bootstrapper-minified-js.template"
cp templates/umd-bootstrapper-js.template $tgt

sed_replace () {
  if [ $# -ne 1 ]; then
      echo "Error: sed-replace function requires one argument"
      exit 1
  fi

  # "-i" needs a suffix in order to work on both OSX and Linux
  sed -i.bak -E "$1" "$tgt"
  rm -f "${tgt}.bak"
}

sed_replace "s/ *\/\/.*//g"
sed_replace "s/deepFreeze/df/g"
sed_replace "s/frozenObject/fo/g"
sed_replace "s/key/k/g"
sed_replace "s/version/v/g"

# trying to exclude '${additionalVersionString}' from being replaced
sed_replace "s/([ (!])additionalVersionString/\1a/g"

sed_replace "s/\r/ /g"

tr '\n' ' ' < "$tgt" > "${tgt}.bak"
cp "${tgt}.bak" "$tgt"
rm -f "${tgt}.bak"

# deduplicate spaces
sed_replace "s/ +/ /g"

# now remove spaces
sed_replace "s/([\(\){},;:?!=&]) +/\1/g"
sed_replace "s/ +([\(\){},;:?!=&])/\1/g"
