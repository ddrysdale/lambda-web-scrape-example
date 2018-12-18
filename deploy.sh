#!/usr/bin/env bash

PACKAGE=careerexplorer-scraper-amazon.zip
OUTPUT=dist

aws lambda update-function-code \
--region us-west-2 \
--function-name careerexplorer-scraper-amazon \
--zip-file fileb://$PWD/$OUTPUT/$PACKAGE
