import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';

const {module, test} = Helpers;

let builder;
module('Unit: Markup Section', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('a section can append a marker', (assert) => {
  const s1 = builder.createMarkupSection('P');
  const m1 = builder.createMarker('hello');

  s1.markers.append(m1);
  assert.equal(s1.markers.length, 1);
});

test('#splitMarker splits the marker at the offset', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 3);
  assert.equal(s.markers.length, 3, 'adds a 3rd marker');
  assert.equal(s.markers.objectAt(0).value, 'hi ', 'original marker unchanged');
  assert.equal(s.markers.objectAt(1).value, 'the', 'first half of split');
  assert.equal(s.markers.objectAt(2).value, 're!', 'second half of split');
});

test('#splitMarker splits the marker at the end offset if provided', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 1, 3);
  assert.equal(s.markers.length, 4, 'adds a marker for the split and has one on each side');
  assert.equal(s.markers.head.value, 'hi ', 'original marker unchanged');
  assert.equal(s.markers.objectAt(1).value, 't');
  assert.equal(s.markers.objectAt(2).value, 'he');
  assert.equal(s.markers.tail.value, 're!');
});

test('#splitMarker does not create an empty marker if offset=0', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 0);
  assert.equal(s.markers.length, 2, 'still 2 markers');
  assert.equal(s.markers.head.value, 'hi ', 'original 1st marker unchanged');
  assert.equal(s.markers.tail.value, 'there!', 'original 2nd marker unchanged');
});

test('#splitMarker does not remove an existing marker when the offset and endOffset are 0', (assert) => {
  const m1 = builder.createMarker('X');
  const s = builder.createMarkupSection('p', [m1]);
  s.splitMarker(m1, 0, 0);

  assert.equal(s.markers.length, 1, 'still 1 marker');
  assert.equal(s.markers.head.value, 'X', 'still correct marker value');
});

test('#isBlank returns true if the text length is zero for two markers', (assert) => {
  const m1 = builder.createMarker('');
  const m2 = builder.createMarker('');
  const s = builder.createMarkupSection('p', [m1,m2]);
  assert.ok(s.isBlank, 'section with two blank markers is blank');
});

test('#isBlank returns true if there are no markers', (assert) => {
  const s = builder.createMarkupSection('p');
  assert.ok(s.isBlank, 'section with no markers is blank');
});

test('#isBlank returns false if there is a marker with length', (assert) => {
  const m = builder.createMarker('a');
  const s = builder.createMarkupSection('p', [m]);
  assert.ok(!s.isBlank, 'section with marker is not blank');
});

test('#markersFor clones markers', (assert) => {
  const m = builder.createMarker('a');
  const s = builder.createMarkupSection('p', [m]);
  const clones = s.markersFor(0, 1);
  assert.equal(clones.length, 1, 'correct number of clones are created');
  assert.ok(clones[0] !== m, 'marker is cloned');
  assert.equal(clones[0].value, m.value, 'marker content is the same');
});

test('#markersFor clones markers, trimming at tailOffset', (assert) => {
  const m1 = builder.createMarker('ab');
  const m2 = builder.createMarker('cd');
  const s = builder.createMarkupSection('p', [m1, m2]);
  const clones = s.markersFor(0, 3);
  assert.equal(clones.length, 2, 'correct number of clones are created');
  assert.equal(clones[0].value, 'ab', 'marker content correct');
  assert.equal(clones[1].value, 'c', 'marker content is correct');
});

test('#markersFor clones markers, trimming at headOffset', (assert) => {
  const m1 = builder.createMarker('ab');
  const m2 = builder.createMarker('cd');
  const s = builder.createMarkupSection('p', [m1, m2]);
  const clones = s.markersFor(1, 4);
  assert.equal(clones.length, 2, 'correct number of clones are created');
  assert.equal(clones[0].value, 'b', 'marker content correct');
  assert.equal(clones[1].value, 'cd', 'marker content is correct');
});

test('#markersFor clones markers, trimming at offsets that do not trim', (assert) => {
  const m1 = builder.createMarker('ab');
  const m2 = builder.createMarker('cd');
  const m3 = builder.createMarker('ef');
  const s = builder.createMarkupSection('p', [m1, m2, m3]);
  const clones = s.markersFor(2, 4);
  assert.equal(clones.length, 1, 'correct number of clones are created');
  assert.equal(clones[0].value, 'cd', 'marker content correct');
});

test('#markersFor clones markers when offset completely surrounds a marker', (assert) => {
  const m1 = builder.createMarker('ab');  // 0-2
  const m2 = builder.createMarker('cd1'); // 2-5
  const m3 = builder.createMarker('cd2'); // 5-8
  const m4 = builder.createMarker('ef');  // 8-10
  const s = builder.createMarkupSection('p', [m1, m2, m3, m4]);
  const clones = s.markersFor(3, 9);
  assert.equal(clones.length, 3, 'correct number of clones are created');
  assert.equal(clones[0].value, 'd1', 'marker content correct');
  assert.equal(clones[1].value, 'cd2', 'marker content correct');
  assert.equal(clones[2].value, 'e', 'marker content correct');
});

test('#markersFor clones a single marker with a tail offset', (assert) => {
  const m1 = builder.createMarker(' def');
  const s = builder.createMarkupSection('p', [m1]);
  const clones = s.markersFor(0,1);
  assert.equal(clones.length, 1);
  assert.equal(clones[0].value, ' ');
});

test('instantiating with invalid tagName throws', (assert) => {
  assert.throws(() => {
    builder.createMarkupSection('blah');
  }, /Cannot set.*tagName.*blah/);
});

test('markerBeforeOffset returns marker the ends at offset', (assert) => {
  let marker = builder.createMarker;
  let section = builder.createMarkupSection('p', [
    marker('a'), marker('bc'), marker('def')
  ]);

  assert.ok(section.markerBeforeOffset(1) === section.markers.head);
  assert.ok(section.markerBeforeOffset(3) === section.markers.objectAt(1));
  assert.ok(section.markerBeforeOffset(6) === section.markers.tail);
});

test('markerBeforeOffset throws if offset is not between markers', (assert) => {
  let marker = builder.createMarker;
  let section = builder.createMarkupSection('p', [
    marker('a'), marker('bc'), marker('def')
  ]);

  assert.throws(
    () => section.markerBeforeOffset(0),
    /not between/
  );
  assert.throws(
    () => section.markerBeforeOffset(2),
    /not between/
  );
  assert.throws(
    () => section.markerBeforeOffset(4),
    /not between/
  );
  assert.throws(
    () => section.markerBeforeOffset(5),
    /not between/
  );
});

test('markerBeforeOffset returns first marker if it is empty and offset is 0', (assert) => {
  let marker = (text) => builder.createMarker(text);
  let section = builder.createMarkupSection('p', [
    marker(''), marker('bc'), marker('def')
  ]);

  assert.ok(section.markerBeforeOffset(0) === section.markers.head);
});

test('splitMarkerAtOffset inserts empty marker when offset is 0', (assert) => {
  let section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

  section.splitMarkerAtOffset(0);

  assert.equal(section.markers.length, 2);
  assert.deepEqual(section.markers.map(m => m.value), ['', 'abc']);
});

test('splitMarkerAtOffset inserts empty marker if section is blank', (assert) => {
  let section = builder.createMarkupSection('p');

  section.splitMarkerAtOffset(0);

  assert.equal(section.markers.length, 1);
  assert.deepEqual(section.markers.map(m => m.value), ['']);
});

test('splitMarkerAtOffset splits marker if offset is contained by marker', (assert) => {
  let section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

  section.splitMarkerAtOffset(1);

  assert.equal(section.markers.length, 2);
  assert.deepEqual(section.markers.map(m => m.value),
                   ['a', 'bc']);
});

test('splitMarkerAtOffset is no-op when offset is at end of marker', (assert) => {
  let section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

  section.splitMarkerAtOffset(3);

  assert.equal(section.markers.length, 1);
  assert.deepEqual(section.markers.map(m => m.value), ['abc']);
});

test('splitMarkerAtOffset does nothing if the is offset is at end', (assert) => {
  let marker = (text) => builder.createMarker(text);
  let section = builder.createMarkupSection('p', [marker('a'), marker('bc')]);

  section.splitMarkerAtOffset(3);

  assert.equal(section.markers.length, 2);
  assert.deepEqual(section.markers.map(m => m.value), ['a', 'bc']);
});

test('splitMarkerAtOffset splits a marker deep in the middle', (assert) => {
  let marker = (text) => builder.createMarker(text);
  let section = builder.createMarkupSection('p', [
    marker('a'), marker('bc'), marker('def'), marker('ghi')
  ]);

  section.splitMarkerAtOffset(5);

  assert.equal(section.markers.length, 5);
  assert.deepEqual(section.markers.map(m => m.value),
                   ['a', 'bc', 'de', 'f', 'ghi']);
});

test('a section has property `isSection`', (assert) => {
  let section = builder.createMarkupSection();
  assert.ok(section.isSection, 'section.isSection');
});

test('#length is correct', (assert) => {
  let expectations;
  Helpers.postAbstract.build(({markupSection, marker, atom}) => {
    expectations = [{
      name: 'blank section',
      length: 0,
      section: markupSection()
    }, {
      name: 'section with empty marker',
      length: 0,
      section: markupSection('p', [marker('')])
    }, {
      name: 'section with single marker',
      length: 'abc'.length,
      section: markupSection('p', [marker('abc')])
    }, {
      name: 'section with multiple markers',
      length: 'abc'.length + 'defg'.length,
      section: markupSection('p', [marker('abc'),marker('defg')])
    }, {
      name: 'section with atom',
      length: 1,
      section: markupSection('p', [atom('mention', 'bob')])
    }, {
      name: 'section with multiple atoms',
      length: 2,
      section: markupSection('p', [atom('mention', 'bob'), atom('mention','other')])
    }, {
      name: 'section with atom and markers',
      length: 'abc'.length + 1,
      section: markupSection('p', [marker('abc'), atom('mention', 'bob')])
    }];
  });

  assert.expect(expectations.length);
  expectations.forEach(({name, length, section}) => {
    assert.equal(section.length, length, `${name} has correct length`);
  });
});
