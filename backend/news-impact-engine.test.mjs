import assert from 'node:assert/strict';
import { classifyNewsFeed, classifyNewsItem, NEWS_ENGINE_VERSION } from './news-impact-engine.mjs';

const exportEvent=classifyNewsItem({id:'1',headline:'US announces new export restrictions on advanced chips to China',summary:''},{ticker:'NVDA',sector:'Semiconductors'});
assert.equal(exportEvent.ruleVersion,NEWS_ENGINE_VERSION);
assert.equal(exportEvent.eventClass,'EXPORT_CONTROLS');
assert.ok(exportEvent.impactScore>=80);
assert.equal(exportEvent.thesisImpact,'THESIS_REVIEW_REQUIRED');
assert.equal(exportEvent.falsifierConfirmed,false);
assert.equal(exportEvent.validationState,'SENSOR_ONLY');

const warning=classifyNewsItem({id:'2',headline:'Company cuts guidance after weak demand',summary:''},{ticker:'TEST',sector:'Industrials'});
assert.equal(warning.eventClass,'GUIDANCE_CUT');
assert.equal(warning.thesisImpact,'THESIS_REVIEW_REQUIRED');
assert.equal(warning.falsifierConfirmed,false);

const neutral=classifyNewsItem({id:'3',headline:'Company opens a new office',summary:''},{ticker:'TEST',sector:'Industrials'});
assert.equal(neutral.eventClass,'UNCLASSIFIED');
assert.equal(neutral.thesisImpact,'NO_CHANGE');

const feed=classifyNewsFeed([{id:'1',headline:'US announces export controls on chips',summary:''},{id:'3',headline:'Company opens a new office',summary:''}],{ticker:'NVDA',sector:'Semiconductors'});
assert.equal(feed.thesisReviewRequired,true);
assert.equal(feed.falsifierConfirmed,false);
assert.ok(feed.maxImpact>=80);
console.log('ATLAS news/thesis impact fixtures: PASS');
