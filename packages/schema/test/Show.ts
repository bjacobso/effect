import * as S from "@fp-ts/codec/Schema"
import * as _ from "@fp-ts/codec/Show"
import * as C from "@fp-ts/data/Context"
import * as E from "@fp-ts/data/Either"
import { pipe } from "@fp-ts/data/Function"
import * as O from "@fp-ts/data/Option"

interface SetService {
  readonly _tag: "SetService"
  readonly show: <A>(shows: [_.Show<A>]) => _.Show<Set<A>>
}

const SetService = C.Tag<SetService>()

const set = <P, A>(item: S.Schema<P, A>): S.Schema<P | SetService, Set<A>> =>
  S.tag(SetService, item)

describe("Show", () => {
  it("empty", () => {
    expect(_.empty).exist
  })

  describe("showFor", () => {
    const ctx = pipe(
      C.empty(),
      C.add(SetService)({
        _tag: "SetService",
        show: <A>(shows: [_.Show<A>]): _.Show<Set<A>> =>
          _.make((a) => `Set([${Array.from(a.values()).map(shows[0].show).join(", ")}])`)
      })
    )

    const showFor = _.showFor(ctx)

    it("dependency", () => {
      const schema = set(S.string)
      expect(showFor(schema).show(new Set("a"))).toEqual(
        "Set([\"a\"])"
      )
    })

    it("string", () => {
      const schema = S.string
      expect(showFor(schema).show("a")).toEqual(
        "\"a\""
      )
    })

    it("number", () => {
      const schema = S.number
      expect(showFor(schema).show(1)).toEqual(
        "1"
      )
    })

    it("boolean", () => {
      const schema = S.boolean
      expect(showFor(schema).show(true)).toEqual(
        "true"
      )
    })

    it("literal", () => {
      const schema = S.equal(1)
      expect(showFor(schema).show(1)).toEqual(
        "1"
      )
    })

    it("tuple", () => {
      const schema = S.tuple(true, S.string, S.number)
      expect(showFor(schema).show(["a", 1])).toEqual(
        "[\"a\", 1]"
      )
    })

    it("nonEmptyArray", () => {
      const schema = S.nonEmptyArray(true, S.string, S.number)
      expect(showFor(schema).show(["a", 1])).toEqual(
        "[\"a\", 1]"
      )
    })

    it("union", () => {
      const schema = S.union(S.string, S.number)
      const s = showFor(schema)
      expect(s.show("a")).toEqual(
        "\"a\""
      )
      expect(s.show(1)).toEqual(
        "1"
      )
    })

    it("struct", () => {
      const schema = S.struct({ a: S.string, b: S.number })
      expect(showFor(schema).show({ a: "a", b: 1 })).toEqual(
        "{ a: \"a\", b: 1 }"
      )
    })

    it("indexSignature", () => {
      const schema = S.indexSignature(S.string)
      expect(showFor(schema).show({ a: "a", b: "b" })).toEqual(
        "{ a: \"a\", b: \"b\" }"
      )
    })

    it("array", () => {
      const schema = S.array(true, S.string)
      expect(showFor(schema).show(["a", "b"])).toEqual(
        "[\"a\", \"b\"]"
      )
    })

    it("refinement", () => {
      const schema = pipe(S.string, S.minLength(2))
      expect(showFor(schema).show("a")).toEqual(
        "\"a\""
      )
    })

    it("option (as structure)", () => {
      const schema = S.option(S.number)
      const show = showFor(schema)
      expect(show.show(O.none)).toEqual(
        "{ _tag: \"None\" }"
      )
      expect(show.show(O.some(1))).toEqual(
        "{ _tag: \"Some\", value: 1 }"
      )
    })

    it("either (as structure)", () => {
      const schema = S.either(S.string, S.number)
      const show = showFor(schema)
      expect(show.show(E.right(1))).toEqual(
        "{ _tag: \"Right\", right: 1 }"
      )
      expect(show.show(E.left("e"))).toEqual(
        "{ _tag: \"Left\", left: \"e\" }"
      )
    })
  })
})
