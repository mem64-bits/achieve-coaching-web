import {describe, expect, it} from "vitest";
import {searchCountries, type CountryOption} from "../countrySearch";

const countries: CountryOption[] = [
    {iso2: "al", name: "Albania", dialCode: "355"},
    {iso2: "gb", name: "United Kingdom", dialCode: "44"},
    {iso2: "ie", name: "Ireland", dialCode: "353"},
    {iso2: "is", name: "Iceland", dialCode: "354"},
    {iso2: "pt", name: "Portugal", dialCode: "351"},
    {iso2: "re", name: "Réunion", dialCode: "262"},
    {iso2: "sx", name: "Sint Maarten", dialCode: "1"},
    {iso2: "us", name: "United States", dialCode: "1"},
];

const isoCodes = (results: CountryOption[]) => results.map((country) => country.iso2);

describe("searchCountries", () => {
    it("matches dial codes by prefix, shortest and lowest code first", () => {
        expect(isoCodes(searchCountries("35", countries))).toEqual(["pt", "ie", "is", "al"]);
        expect(isoCodes(searchCountries("353", countries))).toEqual(["ie"]);
    });

    it("accepts a leading plus and spaces in a dial code", () => {
        expect(isoCodes(searchCountries("+44", countries))).toEqual(["gb"]);
        expect(isoCodes(searchCountries(" + 3 5 3 ", countries))).toEqual(["ie"]);
    });

    it("matches country names, starting letters first, ignoring case and accents", () => {
        expect(isoCodes(searchCountries("ire", countries))).toEqual(["ie"]);
        expect(isoCodes(searchCountries("united", countries))).toEqual(["gb", "us"]);
        expect(isoCodes(searchCountries("reunion", countries))).toEqual(["re"]);
        expect(isoCodes(searchCountries("land", countries))).toEqual(["ie", "is"]);
    });

    it("matches two-letter country codes", () => {
        expect(isoCodes(searchCountries("pt", countries))).toEqual(["pt"]);
    });

    it("returns every country for an empty query and nothing for no match", () => {
        expect(searchCountries("  ", countries)).toHaveLength(countries.length);
        expect(searchCountries("999", countries)).toEqual([]);
        expect(searchCountries("atlantis", countries)).toEqual([]);
    });
});
