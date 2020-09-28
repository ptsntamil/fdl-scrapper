const selectors = {
  USERNAME: "#username",
  PASSWORD: "#password",
  IFRAME: "iframe",
  NAME:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__name a",
  POSITION:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__highlight-keyword .t-bold",
  COMPANY:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__position-company a span:first-child",
  COMPANYLINK:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__position-company a",
  DURATION:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__entity dl dd:nth-child(4)>span:first-child",
  CITY:
    "#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__profile-info .result-lockup__entity .result-lockup__misc-item",
  RESULT_ITEM: ".search-results__result-item",
  PAGINATION_COUNT: ".search-results__pagination-list li:last-child button",
  HELP_NAV_BAR: ".navbar-help",
  SEARCH_INPUT: "#global-typeahead-search-input",
  WEBSITE: ".meta-links div:first-child a",
  ALL_EMPLOYEES: "a[data-control-name='topcard_employees']",
  DECISION_MAKERS: "a[data-control-name='num_decision-makers']",
};
exports.constants = selectors;
