UNIT_TESTS = $(shell find spec/unit -name "*.spec.coffee")
INTEGRATION_TESTS = $(shell find spec/integration -name "*.spec.coffee")
ALL_TESTS = $(shell find spec -name "*.spec.coffee")

build:
	coffee -o lib -c src

clean:
	rm -rf lib reports logs/*.log

test:
	@./node_modules/mocha/bin/mocha --compilers coffee:coffee-script $(ALL_TESTS)

test_unit:
	@./node_modules/mocha/bin/mocha --compilers coffee:coffee-script $(UNIT_TESTS)

test_integration:
	@./node_modules/mocha/bin/mocha --compilers coffee:coffee-script $(INTEGRATION_TESTS)

.PHONY:
	clean build test