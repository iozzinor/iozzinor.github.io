export function *iterateUpperRightQuadrant() {
	for (var i = 18; i > 10; --i)
		yield i;
}

export function *iterateUpperLeftQuadrant() {
	for (var i = 21; i < 29; ++i)
		yield i;
}

/**
 * @return An iterator over upper jaw tooth numbers.
 */
export function *iterateUpperJaw() {
    for (var i of iterateUpperRightQuadrant())
        yield i;
    for (var i of iterateUpperLeftQuadrant())
        yield i;
}

export function *iterateLowerRightQuadrant() {
	for (var i = 48; i > 40; --i)
		yield i;
}

export function *iterateLowerLeftQuadrant() {
	for (var i = 31; i < 39; ++i)
		yield i;
}

/**
 * @return An iterator over lower jaw tooth numbers.
 */
export function *iterateLowerJaw() {
    for (var i of iterateLowerRightQuadrant())
        yield i;
    for (var i of iterateLowerLeftQuadrant())
        yield i;
}

export function *iterateTeeth() {
    for (var i of iterateUpperJaw())
        yield i;
    for (var i of iterateLowerJaw())
        yield i;
}

export function isInRightQuadrant(toothNumber) {
    return (toothNumber > 10 && toothNumber < 19)
        || (toothNumber > 40 && toothNumber < 49);
}

export function isInLeftQuadrant(toothNumber) {
    return (toothNumber > 20 && toothNumber < 29)
        || (toothNumber > 30 && toothNumber < 39);
}

export function getToothSitesFromPatientRightToLeft(toothNumber) {
    return isInRightQuadrant(toothNumber) ? ['distal', 'middle', 'mesial'] : ['mesial', 'middle', 'distal'];
}
