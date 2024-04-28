tb-aigrammar.xpi: $(shell ls |grep -v Makefile|grep -v tb-aigrammar.xpi|grep -v doc)
	zip -r $@ $^

clean:
	rm -f tb-aigrammar.xpi

.PHONY: clean
.PRECIOUS:
.SECONDARY:
