import * as S from "@effect/schema/Schema"
import * as Util from "@effect/schema/test/util"
import { describe, it } from "vitest"

describe("ReadonlySet > readonlySet", () => {
  it("property tests", () => {
    Util.roundtrip(S.readonlySet(S.number))
  })

  it("decoding", async () => {
    const schema = S.readonlySet(S.number)
    await Util.expectDecodeUnknownSuccess(schema, [], new Set([]))
    await Util.expectDecodeUnknownSuccess(schema, [1, 2, 3], new Set([1, 2, 3]))

    await Util.expectDecodeUnknownFailure(
      schema,
      null,
      `(ReadonlyArray<number> <-> ReadonlySet<number>)
└─ From side transformation failure
   └─ Expected ReadonlyArray<number>, actual null`
    )
    await Util.expectDecodeUnknownFailure(
      schema,
      [1, "a"],
      `(ReadonlyArray<number> <-> ReadonlySet<number>)
└─ From side transformation failure
   └─ ReadonlyArray<number>
      └─ [1]
         └─ Expected a number, actual "a"`
    )
  })

  it("encoding", async () => {
    const schema = S.readonlySet(S.number)
    await Util.expectEncodeSuccess(schema, new Set(), [])
    await Util.expectEncodeSuccess(schema, new Set([1, 2, 3]), [1, 2, 3])
  })
})
