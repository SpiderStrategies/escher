test:
	@python -m SimpleHTTPServer& open http://localhost:8000/test/runner.html

.PHONY: test
