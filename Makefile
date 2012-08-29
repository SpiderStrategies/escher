VERSION = $(shell node -e 'require("./package.json").version' -p)
HEADER = "/*!\n * escher.js v$(VERSION) \n * Copyright 2012, Spider Strategies <nathan.bowser@spiderstrategies.com> \n * escher.js may be freely distributed under the BSD license. \n*/"
DIST = dist/escher-$(VERSION).js
MIN = dist/escher-$(VERSION).min.js

clean:
	@rm -rf dist

build: clean
	@mkdir dist
	@echo $(HEADER) > $(DIST) && cat src/escher.js >> $(DIST)
	@echo $(HEADER) > $(MIN) && node_modules/.bin/uglifyjs src/escher.js >> $(MIN)

test:
	@python -m SimpleHTTPServer& open http://localhost:8000/test/runner.html

.PHONY: test
