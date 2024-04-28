tb-aigrammar.xpi: $(shell ls |grep -v Makefile|grep -v tb.xpi|grep -v doc)
	zip -r -j $@ $^

clean:
	rm -f tb-aigrammar.xpi

.PHONY: clean
.PRECIOUS:
.SECONDARY:
