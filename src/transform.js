import _ from 'lodash';
import numWord from './ref';

export function numToWord(num) {
  return _.reduce(numWord, (accum, item) => {
    return item.num === num ? item.word : accum;
  }, '');
}

export function wordToNum(word) {
  return _.reduce(numWord, (accum, item) => {
    return item.word === word && word.toLowerCase() ? item.num : accum;
  }, -1);
}