package com.myinterests.backend.controller;

import com.myinterests.backend.domain.Continent;
import com.myinterests.backend.domain.Country;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.repository.ContinentRepository;
import com.myinterests.backend.repository.CountryRepository;
import com.myinterests.backend.repository.InterestTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DataController {

    private final ContinentRepository continentRepository;
    private final CountryRepository countryRepository;
    private final InterestTagRepository interestTagRepository;

    @GetMapping("/continents")
    public ResponseEntity<List<Continent>> getAllContinents() {
        return ResponseEntity.ok(continentRepository.findAll());
    }

    @GetMapping("/countries")
    public ResponseEntity<List<Country>> getAllCountries() {
        return ResponseEntity.ok(countryRepository.findAll());
    }

    @GetMapping("/countries/by-continent/{continentId}")
    public ResponseEntity<List<Country>> getCountriesByContinent(@PathVariable Long continentId) {
        return ResponseEntity.ok(countryRepository.findByContinentIdOrderByName(continentId));
    }

    @GetMapping("/interest-tags")
    public ResponseEntity<List<InterestTag>> getAllInterestTags() {
        return ResponseEntity.ok(interestTagRepository.findAll());
    }

    @GetMapping("/interest-tags/search")
    public ResponseEntity<List<InterestTag>> searchInterestTags(@RequestParam String query) {
        return ResponseEntity.ok(interestTagRepository.findByNameContainingIgnoreCaseOrderByName(query));
    }
}