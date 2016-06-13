/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ts from "typescript";
import * as Lint from "../lint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING_FACTORY = (lineLimit: number) => {
        return `Exceeds maximum line length of ${lineLimit}`;
    };

    public isEnabled(): boolean {
        if (super.isEnabled()) {
            const option = this.getOptions().ruleArguments[0];
            if (typeof option === "number" && option > 0) {
                return true;
            }
        }
        return false;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const ruleFailures: Lint.RuleFailure[] = [];
        const lineLimit = this.getOptions().ruleArguments[0];
        const lineStarts = sourceFile.getLineStarts();
        const errorString = Rule.FAILURE_STRING_FACTORY(lineLimit);
        const disabledIntervals = this.getOptions().disabledIntervals;
        const source = sourceFile.getFullText();

        for (let i = 0; i < lineStarts.length - 1; ++i) {
            const from = lineStarts[i], to = lineStarts[i + 1];
            if ((to - from - 1) > lineLimit && !((to - from - 2) === lineLimit && source[to - 2] === "\r")) {
                // first condition above is whether the line (minus the newline) is larger than the line limit
                // second two check for windows line endings, that is, check to make sure it is not the case
                // that we are only over by the limit by exactly one and that the character we are over the
                // limit by is a '\r' character which does not count against the limit
                // (and thus we are not actually over the limit).
                const ruleFailure = new Lint.RuleFailure(sourceFile, from, to - 1, errorString, this.getOptions().ruleName);
                if (!Lint.doesIntersect(ruleFailure, disabledIntervals)) {
                    ruleFailures.push(ruleFailure);
                }
            }
          }

        return ruleFailures;
    }
}
