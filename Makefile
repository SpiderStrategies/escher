VERSION = $(shell node -e 'require("./package.json").version' -p)

clean:
	@rm -rf dist

build: clean
	@mkdir dist
	@cp src/escher.js dist/escher-$(VERSION).js
	@node_modules/.bin/uglifyjs -o dist/escher-$(VERSION).min.js src/escher.js

test:
	@python -m SimpleHTTPServer& open http://localhost:8000/test/runner.html

.PHONY: test
