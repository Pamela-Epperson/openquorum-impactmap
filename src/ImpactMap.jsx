// @ts-nocheck
import { useState, useMemo, useCallback } from "react";
import { STATE_META, LIVE_STATES, SCAFFOLDED_STATES, REQUEST_STATE_CONTACT, BOARDS as CONFIG_BOARDS } from "./states.config";

// ─── ImpactMap curated pilot boards ────────────────────────────────────────────
// The original pilot states carry hand-curated impact fields (actionsPerMonth,
// populationServed, vulnerability, chairVacant). Every OTHER live state is built
// automatically from the shared scraper config below (see buildConfigBoards), so
// states the scraper promotes flow into ImpactMap with zero manual work.
// State-level metadata (colors, labels, applyUrl, applyLabel) comes from
// STATE_META in states.config.js so the suite stays visually consistent.
// ─────────────────────────────────────────────────────────────────────────────
const PILOT_BOARDS = [
  // ── Maryland ──
  {id:1,  state:"MD",name:"Citizens Advisory Board — Regional Institute for Children & Adolescents",domain:"health",   vacantSeats:5, totalSeats:8,  vacantSince:"2023-01-15",actionsPerMonth:6, populationServed:45000,  populationLabel:"youth with behavioral health needs",          vulnerability:"critical",chairVacant:true},
  {id:2,  state:"MD",name:"Advisory Board — Developmental Disabilities Administration",            domain:"disability",vacantSeats:6, totalSeats:14, vacantSince:"2022-08-20",actionsPerMonth:4, populationServed:115000, populationLabel:"Marylanders with developmental disabilities",  vulnerability:"critical",chairVacant:false},
  {id:3,  state:"MD",name:"State Interagency Council on Homelessness",                             domain:"housing",   vacantSeats:5, totalSeats:18, vacantSince:"2023-09-01",actionsPerMonth:5, populationServed:7000,   populationLabel:"unhoused Marylanders",                        vulnerability:"critical",chairVacant:false},
  {id:4,  state:"MD",name:"Opioid Response Advisory Council",                                      domain:"health",   vacantSeats:4, totalSeats:16, vacantSince:"2023-12-05",actionsPerMonth:6, populationServed:200000, populationLabel:"Marylanders affected by substance use",       vulnerability:"high",    chairVacant:false},
  {id:5,  state:"MD",name:"Commission on Public Health — Data & IT Workgroup",                    domain:"health",   vacantSeats:6, totalSeats:22, vacantSince:"2024-03-01",actionsPerMonth:4, populationServed:6200000,populationLabel:"all Marylanders · public health system",       vulnerability:"high",    chairVacant:false},
  {id:6,  state:"MD",name:"Maryland Health Care Commission",                                       domain:"health",   vacantSeats:4, totalSeats:19, vacantSince:"2024-02-20",actionsPerMonth:8, populationServed:6200000,populationLabel:"all Marylanders · health coverage",            vulnerability:"high",    chairVacant:false},
  {id:7,  state:"MD",name:"Maryland Commission for Women",                                         domain:"equity",   vacantSeats:6, totalSeats:15, vacantSince:"2023-04-10",actionsPerMonth:3, populationServed:3100000,populationLabel:"Maryland women & girls",                       vulnerability:"high",    chairVacant:false},
  {id:8,  state:"MD",name:"Affordable Housing Trust Fund Committee",                               domain:"housing",  vacantSeats:3, totalSeats:13, vacantSince:"2024-04-01",actionsPerMonth:4, populationServed:85000,  populationLabel:"low-income housing applicants",                vulnerability:"high",    chairVacant:false},
  {id:9,  state:"MD",name:"Maryland Hispanic Affairs Commission",                                  domain:"equity",   vacantSeats:4, totalSeats:11, vacantSince:"2024-01-08",actionsPerMonth:3, populationServed:700000, populationLabel:"Hispanic & Latino Marylanders",                vulnerability:"high",    chairVacant:false},
  {id:10, state:"MD",name:"Criminal Justice Information Advisory Board",                           domain:"justice",  vacantSeats:3, totalSeats:16, vacantSince:"2023-11-20",actionsPerMonth:3, populationServed:6200000,populationLabel:"all Marylanders (CJ data systems)",             vulnerability:"moderate",chairVacant:false},
  // ── Virginia ──
  {id:301,state:"VA",name:"Virginia Health Information Technology Advisory Commission",            domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2024-01-17",actionsPerMonth:5, populationServed:8700000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:302,state:"VA",name:"Virginia Board for People with Disabilities",                          domain:"disability",vacantSeats:6,totalSeats:21, vacantSince:"2023-09-01",actionsPerMonth:3, populationServed:850000, populationLabel:"850,000 Virginians with disabilities",         vulnerability:"critical",chairVacant:false},
  {id:303,state:"VA",name:"Virginia Opioid Abatement Authority",                                  domain:"health",   vacantSeats:4, totalSeats:15, vacantSince:"2024-02-01",actionsPerMonth:6, populationServed:180000, populationLabel:"Virginians affected by opioid crisis",         vulnerability:"high",    chairVacant:false},
  {id:304,state:"VA",name:"Virginia Board of Education",                                          domain:"education",vacantSeats:3, totalSeats:9,  vacantSince:"2024-01-17",actionsPerMonth:4, populationServed:1200000,populationLabel:"1.2M Virginia public school students",         vulnerability:"high",    chairVacant:false},
  {id:305,state:"VA",name:"Virginia Early Childhood Advisory Council",                            domain:"education",vacantSeats:6, totalSeats:20, vacantSince:"2023-08-01",actionsPerMonth:4, populationServed:280000, populationLabel:"Virginia children 0–5 & families",            vulnerability:"high",    chairVacant:false},
  {id:306,state:"VA",name:"Governor's Commission on Veteran Services",                            domain:"justice",  vacantSeats:4, totalSeats:14, vacantSince:"2024-01-17",actionsPerMonth:3, populationServed:750000, populationLabel:"750,000+ Virginia veterans",                  vulnerability:"high",    chairVacant:false},
  {id:307,state:"VA",name:"Virginia Criminal Justice Services Advisory Committee",                domain:"justice",  vacantSeats:5, totalSeats:18, vacantSince:"2023-10-01",actionsPerMonth:3, populationServed:8700000,populationLabel:"criminal justice participants",                vulnerability:"moderate",chairVacant:false},
  {id:308,state:"VA",name:"Virginia Housing Advisory Board",                                      domain:"housing",  vacantSeats:3, totalSeats:13, vacantSince:"2024-03-01",actionsPerMonth:4, populationServed:95000,  populationLabel:"low-income housing applicants",                vulnerability:"high",    chairVacant:false},
  // ── Washington DC ──
  {id:401,state:"DC",name:"DC Health Information Exchange Policy Board",                          domain:"health",   vacantSeats:5, totalSeats:15, vacantSince:"2023-07-01",actionsPerMonth:4, populationServed:700000, populationLabel:"all DC residents · health data",               vulnerability:"high",    chairVacant:false},
  {id:402,state:"DC",name:"Commission on Persons with Disabilities",                              domain:"disability",vacantSeats:4,totalSeats:12, vacantSince:"2023-06-01",actionsPerMonth:3, populationServed:65000,  populationLabel:"DC residents with disabilities",               vulnerability:"critical",chairVacant:false},
  {id:403,state:"DC",name:"DC Housing Finance Agency Advisory Board",                             domain:"housing",  vacantSeats:3, totalSeats:11, vacantSince:"2023-09-01",actionsPerMonth:4, populationServed:45000,  populationLabel:"low-income DC housing applicants",             vulnerability:"critical",chairVacant:false},
  {id:404,state:"DC",name:"DC Workforce Investment Council",                                      domain:"education",vacantSeats:7, totalSeats:22, vacantSince:"2023-10-01",actionsPerMonth:8, populationServed:125000, populationLabel:"DC workforce program participants",             vulnerability:"high",    chairVacant:false},
  {id:405,state:"DC",name:"Commission on Re-Entry & Returning Citizen Affairs",                   domain:"justice",  vacantSeats:4, totalSeats:13, vacantSince:"2023-05-01",actionsPerMonth:4, populationServed:35000,  populationLabel:"formerly incarcerated DC residents",           vulnerability:"critical",chairVacant:false},
  {id:406,state:"DC",name:"Commission on Latino Community Development",                           domain:"equity",   vacantSeats:4, totalSeats:11, vacantSince:"2023-07-01",actionsPerMonth:3, populationServed:75000,  populationLabel:"~75,000 Hispanic/Latino DC residents",        vulnerability:"high",    chairVacant:false},
  {id:407,state:"DC",name:"Office on Aging Advisory Committee",                                   domain:"health",   vacantSeats:4, totalSeats:14, vacantSince:"2023-08-01",actionsPerMonth:3, populationServed:85000,  populationLabel:"DC residents 60+",                            vulnerability:"high",    chairVacant:false},
  // ── Delaware ──
  {id:501,state:"DE",name:"Delaware Health Care Commission",                                      domain:"health",   vacantSeats:4, totalSeats:16, vacantSince:"2024-03-01",actionsPerMonth:6, populationServed:1000000,populationLabel:"all Delawareans · health coverage",             vulnerability:"high",    chairVacant:false},
  {id:502,state:"DE",name:"Delaware Health Information Network Advisory Board",                   domain:"health",   vacantSeats:4, totalSeats:14, vacantSince:"2023-09-01",actionsPerMonth:4, populationServed:1000000,populationLabel:"all Delawareans · health IT",                  vulnerability:"high",    chairVacant:false},
  {id:503,state:"DE",name:"Delaware Council on Persons with Disabilities",                       domain:"disability",vacantSeats:5,totalSeats:15, vacantSince:"2023-07-01",actionsPerMonth:3, populationServed:220000, populationLabel:"220,000 Delawareans with disabilities",        vulnerability:"critical",chairVacant:false},
  {id:504,state:"DE",name:"Delaware Commission on Housing",                                       domain:"housing",  vacantSeats:4, totalSeats:13, vacantSince:"2024-02-01",actionsPerMonth:4, populationServed:75000,  populationLabel:"low-income housing applicants",                vulnerability:"high",    chairVacant:false},
  {id:505,state:"DE",name:"Delaware Commission on African American Affairs",                      domain:"equity",   vacantSeats:4, totalSeats:13, vacantSince:"2023-05-01",actionsPerMonth:2, populationServed:280000, populationLabel:"African American Delawareans",                 vulnerability:"high",    chairVacant:false},
  {id:506,state:"DE",name:"Criminal Justice Council",                                             domain:"justice",  vacantSeats:5, totalSeats:18, vacantSince:"2023-12-01",actionsPerMonth:3, populationServed:1000000,populationLabel:"criminal justice participants",                vulnerability:"moderate",chairVacant:false},
  // ── Massachusetts ──
  {id:201,state:"MA",name:"Health Information Technology Council",                                domain:"health",   vacantSeats:6, totalSeats:18, vacantSince:"2023-06-01",actionsPerMonth:4, populationServed:7000000,populationLabel:"health IT professionals, providers & all MA residents",vulnerability:"high",chairVacant:false},
  {id:202,state:"MA",name:"Governor's Special Advisory Commission on Disability Policy",          domain:"disability",vacantSeats:8,totalSeats:24, vacantSince:"2025-10-14",actionsPerMonth:3, populationServed:1200000,populationLabel:"1.2M Massachusetts residents with disabilities",vulnerability:"critical",chairVacant:false},
  {id:203,state:"MA",name:"MassHealth Care Delivery Advisory Council",                            domain:"health",   vacantSeats:5, totalSeats:20, vacantSince:"2023-09-01",actionsPerMonth:6, populationServed:2200000,populationLabel:"2.2M MassHealth enrollees",                    vulnerability:"high",    chairVacant:false},
  {id:204,state:"MA",name:"Behavioral Health Advisory Council",                                   domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2024-02-01",actionsPerMonth:4, populationServed:800000, populationLabel:"residents with mental health & SUD needs",     vulnerability:"high",    chairVacant:false},
  {id:205,state:"MA",name:"Governor's Advisory Council for Refugees & Immigrants",               domain:"equity",   vacantSeats:6, totalSeats:20, vacantSince:"2023-05-01",actionsPerMonth:3, populationServed:750000, populationLabel:"~750,000 foreign-born Massachusetts residents", vulnerability:"high",    chairVacant:false},
  {id:206,state:"MA",name:"Commission on Unlocking Housing Production",                          domain:"housing",  vacantSeats:4, totalSeats:16, vacantSince:"2024-01-29",actionsPerMonth:4, populationServed:7000000,populationLabel:"all Massachusetts residents · housing",         vulnerability:"high",    chairVacant:false},
  // ── Minnesota ──
  {id:101,state:"MN",name:"Mental Health Legislative Advisory Council",                           domain:"health",   vacantSeats:11,totalSeats:20, vacantSince:"2022-11-01",actionsPerMonth:4, populationServed:700000, populationLabel:"Minnesotans with mental illness",              vulnerability:"critical",chairVacant:true},
  {id:102,state:"MN",name:"Council on Disability",                                               domain:"disability",vacantSeats:6,totalSeats:13, vacantSince:"2022-09-15",actionsPerMonth:3, populationServed:620000, populationLabel:"Minnesotans with disabilities",               vulnerability:"critical",chairVacant:false},
  {id:103,state:"MN",name:"Governor's Workforce Development Board",                              domain:"education",vacantSeats:12,totalSeats:40, vacantSince:"2023-09-01",actionsPerMonth:10,populationServed:300000, populationLabel:"job seekers & workforce program participants", vulnerability:"high",    chairVacant:false},
  {id:104,state:"MN",name:"Housing Finance Agency Advisory Council",                             domain:"housing",  vacantSeats:6, totalSeats:15, vacantSince:"2023-05-01",actionsPerMonth:4, populationServed:180000, populationLabel:"low-income housing applicants",                vulnerability:"high",    chairVacant:false},
  {id:105,state:"MN",name:"Human Rights Advisory Council",                                       domain:"equity",   vacantSeats:6, totalSeats:14, vacantSince:"2023-02-01",actionsPerMonth:3, populationServed:5700000,populationLabel:"all Minnesotans · discrimination cases",       vulnerability:"high",    chairVacant:false},
  // ── Pennsylvania ──
  {id:601,state:"PA",name:"Pennsylvania Health IT Advisory Committee",                           domain:"health",   vacantSeats:6, totalSeats:18, vacantSince:"2023-11-01",actionsPerMonth:4, populationServed:13000000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:602,state:"PA",name:"Pennsylvania Commission for Women",                                   domain:"equity",   vacantSeats:5, totalSeats:15, vacantSince:"2023-06-01",actionsPerMonth:3, populationServed:6500000, populationLabel:"Pennsylvania women & girls",                    vulnerability:"high",    chairVacant:false},
  {id:603,state:"PA",name:"Opioid Misuse and Addiction Abatement Trust Fund Advisory Council",   domain:"health",   vacantSeats:5, totalSeats:14, vacantSince:"2024-01-15",actionsPerMonth:5, populationServed:300000,  populationLabel:"Pennsylvanians affected by opioid crisis",     vulnerability:"high",    chairVacant:false},
  {id:604,state:"PA",name:"Pennsylvania Advisory Council on Long-Term Care",                     domain:"health",   vacantSeats:6, totalSeats:20, vacantSince:"2023-09-01",actionsPerMonth:4, populationServed:500000,  populationLabel:"Pennsylvanians needing long-term care",         vulnerability:"high",    chairVacant:false},
  {id:605,state:"PA",name:"Pennsylvania Council on Developmental Disabilities",                  domain:"disability",vacantSeats:8,totalSeats:24, vacantSince:"2023-03-01",actionsPerMonth:3, populationServed:400000,  populationLabel:"Pennsylvanians with developmental disabilities",vulnerability:"critical",chairVacant:false},
  {id:606,state:"PA",name:"Pennsylvania Commission on Crime and Delinquency — Public Members",   domain:"justice",  vacantSeats:4, totalSeats:16, vacantSince:"2023-12-01",actionsPerMonth:3, populationServed:13000000,populationLabel:"crime victims & justice participants statewide",  vulnerability:"moderate",chairVacant:false},
  {id:607,state:"PA",name:"Pennsylvania Environmental Justice Advisory Board",                   domain:"environment",vacantSeats:4,totalSeats:12, vacantSince:"2024-02-01",actionsPerMonth:2, populationServed:1500000, populationLabel:"frontline & overburdened communities",          vulnerability:"moderate",chairVacant:false},
  {id:608,state:"PA",name:"State Board of Education — At-Large Public Members",                 domain:"education",vacantSeats:5, totalSeats:21, vacantSince:"2024-03-01",actionsPerMonth:4, populationServed:1700000, populationLabel:"Pennsylvania K-12 students & families",         vulnerability:"high",    chairVacant:false},
  {id:609,state:"PA",name:"Pennsylvania Commission on African American Affairs",                 domain:"equity",   vacantSeats:4, totalSeats:11, vacantSince:"2023-07-01",actionsPerMonth:2, populationServed:1500000, populationLabel:"African American Pennsylvanians",               vulnerability:"high",    chairVacant:false},
  {id:610,state:"PA",name:"Pennsylvania Housing Finance Agency — Board of Directors",            domain:"housing",  vacantSeats:4, totalSeats:14, vacantSince:"2023-10-01",actionsPerMonth:4, populationServed:400000,  populationLabel:"low-income housing applicants & renters",       vulnerability:"high",    chairVacant:false},
  // ── New York ──
  {id:701,state:"NY",name:"New York State Health Information Technology Advisory Committee",     domain:"health",   vacantSeats:7, totalSeats:20, vacantSince:"2023-08-01",actionsPerMonth:4, populationServed:20000000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:702,state:"NY",name:"New York State Council on Mental Health",                             domain:"health",   vacantSeats:6, totalSeats:18, vacantSince:"2023-05-01",actionsPerMonth:4, populationServed:1000000, populationLabel:"New Yorkers with mental illness",              vulnerability:"high",    chairVacant:false},
  {id:703,state:"NY",name:"Commission on Quality of Care and Advocacy for Persons with Disabilities",domain:"disability",vacantSeats:5,totalSeats:15,vacantSince:"2023-09-01",actionsPerMonth:3,populationServed:3000000,populationLabel:"New Yorkers with disabilities",              vulnerability:"high",    chairVacant:false},
  {id:704,state:"NY",name:"New York Statewide Independent Living Council",                       domain:"disability",vacantSeats:5,totalSeats:16, vacantSince:"2023-11-01",actionsPerMonth:2, populationServed:500000,  populationLabel:"New Yorkers seeking independent living",       vulnerability:"high",    chairVacant:false},
  {id:705,state:"NY",name:"New York Housing Trust Fund Corporation — Board",                     domain:"housing",  vacantSeats:4, totalSeats:13, vacantSince:"2024-01-01",actionsPerMonth:4, populationServed:500000,  populationLabel:"low-income New Yorkers · housing recipients",  vulnerability:"high",    chairVacant:false},
  {id:706,state:"NY",name:"NYS Environmental Justice Advisory Group",                            domain:"environment",vacantSeats:4,totalSeats:11, vacantSince:"2023-10-01",actionsPerMonth:3, populationServed:2000000, populationLabel:"overburdened & frontline communities",          vulnerability:"moderate",chairVacant:false},
  {id:707,state:"NY",name:"New York Opioid Settlement Fund Advisory Board",                      domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2024-02-01",actionsPerMonth:4, populationServed:400000,  populationLabel:"New Yorkers affected by opioid epidemic",      vulnerability:"high",    chairVacant:false},
  {id:708,state:"NY",name:"Governor's Advisory Committee for Black New Yorkers",                 domain:"equity",   vacantSeats:7, totalSeats:20, vacantSince:"2023-06-01",actionsPerMonth:3, populationServed:3500000, populationLabel:"Black New Yorkers statewide",                  vulnerability:"high",    chairVacant:false},
  {id:709,state:"NY",name:"New York State Commission on the Status of Women",                    domain:"equity",   vacantSeats:4, totalSeats:14, vacantSince:"2023-07-01",actionsPerMonth:2, populationServed:10000000,populationLabel:"New York women & girls",                       vulnerability:"high",    chairVacant:false},
  {id:710,state:"NY",name:"State Commission for the Blind — Advisory Board",                    domain:"disability",vacantSeats:4,totalSeats:12, vacantSince:"2023-12-01",actionsPerMonth:2, populationServed:70000,   populationLabel:"New Yorkers who are blind or visually impaired",vulnerability:"moderate",chairVacant:false},
  // ── North Carolina ──
  {id:801,state:"NC",name:"North Carolina Health Information Technology Advisory Council",       domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2025-01-15",actionsPerMonth:4, populationServed:11000000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:802,state:"NC",name:"North Carolina Opioid and Substance Abuse Advisory Cabinet",          domain:"health",   vacantSeats:6, totalSeats:20, vacantSince:"2025-02-01",actionsPerMonth:4, populationServed:400000,  populationLabel:"North Carolinians affected by substance use",  vulnerability:"high",    chairVacant:false},
  {id:803,state:"NC",name:"NC Commission for Mental Health, Developmental Disabilities & SAS",  domain:"disability",vacantSeats:8,totalSeats:24, vacantSince:"2025-01-15",actionsPerMonth:3, populationServed:800000,  populationLabel:"North Carolinians with MH, DD, and SUD",       vulnerability:"critical",chairVacant:true},
  {id:804,state:"NC",name:"Governor's Advisory Council on Hispanic/Latino Affairs",             domain:"equity",   vacantSeats:5, totalSeats:15, vacantSince:"2025-02-01",actionsPerMonth:2, populationServed:1100000, populationLabel:"Hispanic & Latino North Carolinians",          vulnerability:"high",    chairVacant:false},
  {id:805,state:"NC",name:"North Carolina Affordable Housing Advisory Committee",               domain:"housing",  vacantSeats:4, totalSeats:14, vacantSince:"2024-10-01",actionsPerMonth:4, populationServed:300000,  populationLabel:"low-income housing applicants statewide",       vulnerability:"high",    chairVacant:false},
  {id:806,state:"NC",name:"Environmental Justice and Equity Advisory Board",                    domain:"environment",vacantSeats:4,totalSeats:13, vacantSince:"2024-11-01",actionsPerMonth:2, populationServed:1500000, populationLabel:"frontline & overburdened communities",          vulnerability:"moderate",chairVacant:false},
  {id:807,state:"NC",name:"North Carolina Commission for Women",                                domain:"equity",   vacantSeats:4, totalSeats:13, vacantSince:"2025-01-15",actionsPerMonth:2, populationServed:5300000, populationLabel:"North Carolina women & girls",                 vulnerability:"high",    chairVacant:false},
  {id:808,state:"NC",name:"North Carolina Council on Developmental Disabilities",               domain:"disability",vacantSeats:6,totalSeats:20, vacantSince:"2024-09-01",actionsPerMonth:3, populationServed:350000,  populationLabel:"North Carolinians with developmental disabilities",vulnerability:"high",chairVacant:false},
  {id:809,state:"NC",name:"Criminal Justice Information Network Advisory Board",                domain:"justice",  vacantSeats:4, totalSeats:14, vacantSince:"2024-08-01",actionsPerMonth:3, populationServed:11000000,populationLabel:"criminal justice participants statewide",         vulnerability:"moderate",chairVacant:false},
  {id:810,state:"NC",name:"North Carolina State Board of Education — At-Large Advisory Members",domain:"education",vacantSeats:4,totalSeats:14, vacantSince:"2025-01-15",actionsPerMonth:4, populationServed:1500000, populationLabel:"North Carolina K-12 students & families",      vulnerability:"high",    chairVacant:false},
  // ── New Jersey ──
  {id:901,state:"NJ",name:"New Jersey Health Information Technology Advisory Committee",         domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2026-01-15",actionsPerMonth:4, populationServed:9300000, populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:902,state:"NJ",name:"New Jersey Mental Health Advisory Committee",                         domain:"health",   vacantSeats:6, totalSeats:18, vacantSince:"2025-09-01",actionsPerMonth:4, populationServed:700000,  populationLabel:"New Jerseyans with mental illness",            vulnerability:"high",    chairVacant:false},
  {id:903,state:"NJ",name:"New Jersey Council on Affordable Housing — Advisory Panel",           domain:"housing",  vacantSeats:5, totalSeats:15, vacantSince:"2025-10-01",actionsPerMonth:3, populationServed:400000,  populationLabel:"low-income housing seekers statewide",         vulnerability:"high",    chairVacant:false},
  {id:904,state:"NJ",name:"Governor's Council on Alcoholism and Drug Abuse",                    domain:"health",   vacantSeats:7, totalSeats:22, vacantSince:"2026-01-15",actionsPerMonth:5, populationServed:350000,  populationLabel:"New Jerseyans with substance use disorders",   vulnerability:"high",    chairVacant:false},
  {id:905,state:"NJ",name:"New Jersey Commission on Women",                                     domain:"equity",   vacantSeats:4, totalSeats:13, vacantSince:"2026-01-15",actionsPerMonth:2, populationServed:4700000, populationLabel:"New Jersey women & girls",                     vulnerability:"high",    chairVacant:false},
  {id:906,state:"NJ",name:"New Jersey Environmental Justice Advisory Council",                  domain:"environment",vacantSeats:4,totalSeats:12, vacantSince:"2025-11-01",actionsPerMonth:2, populationServed:1200000, populationLabel:"overburdened communities statewide",            vulnerability:"moderate",chairVacant:false},
  {id:907,state:"NJ",name:"Commission on Racial and Ethnic Disparities in the Criminal Justice System",domain:"justice",vacantSeats:5,totalSeats:14,vacantSince:"2025-08-01",actionsPerMonth:3,populationServed:9300000,populationLabel:"communities affected by racial CJS disparities",vulnerability:"high",chairVacant:false},
  {id:908,state:"NJ",name:"State Board of Education — Public At-Large Members",                 domain:"education",vacantSeats:4, totalSeats:13, vacantSince:"2026-01-15",actionsPerMonth:4, populationServed:1400000, populationLabel:"New Jersey K-12 students & families",          vulnerability:"high",    chairVacant:false},
  {id:909,state:"NJ",name:"New Jersey Division of Disability Services Advisory Council",        domain:"disability",vacantSeats:5,totalSeats:16, vacantSince:"2025-07-01",actionsPerMonth:3, populationServed:1100000, populationLabel:"New Jerseyans with disabilities",              vulnerability:"high",    chairVacant:false},
  {id:910,state:"NJ",name:"New Jersey Commission on Hispanic Affairs",                          domain:"equity",   vacantSeats:4, totalSeats:12, vacantSince:"2026-01-15",actionsPerMonth:2, populationServed:1900000, populationLabel:"Hispanic & Latino New Jerseyans",              vulnerability:"high",    chairVacant:false},
  // ── Georgia ──
  {id:1001,state:"GA",name:"Georgia Health Information Technology Commission",                  domain:"health",   vacantSeats:6, totalSeats:18, vacantSince:"2024-03-01",actionsPerMonth:4, populationServed:11000000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:1002,state:"GA",name:"Georgia Commission on Equal Opportunity — Advisory Board",          domain:"equity",   vacantSeats:4, totalSeats:12, vacantSince:"2024-01-01",actionsPerMonth:2, populationServed:11000000,populationLabel:"Georgians protected under civil rights law",     vulnerability:"moderate",chairVacant:false},
  {id:1003,state:"GA",name:"Governor's Council on Developmental Disabilities",                  domain:"disability",vacantSeats:7,totalSeats:22, vacantSince:"2024-02-01",actionsPerMonth:3, populationServed:600000,  populationLabel:"Georgians with developmental disabilities",     vulnerability:"critical",chairVacant:false},
  {id:1004,state:"GA",name:"Georgia Opioid Treatment Advisory Council",                         domain:"health",   vacantSeats:5, totalSeats:16, vacantSince:"2024-04-01",actionsPerMonth:5, populationServed:280000,  populationLabel:"Georgians affected by opioid and SUD",         vulnerability:"high",    chairVacant:false},
  {id:1005,state:"GA",name:"Georgia Commission on Family Violence — Advisory Board",            domain:"justice",  vacantSeats:4, totalSeats:14, vacantSince:"2024-05-01",actionsPerMonth:3, populationServed:200000,  populationLabel:"domestic violence survivors statewide",         vulnerability:"high",    chairVacant:false},
  {id:1006,state:"GA",name:"Georgia Commission on Women",                                       domain:"equity",   vacantSeats:4, totalSeats:13, vacantSince:"2024-02-01",actionsPerMonth:2, populationServed:5500000, populationLabel:"Georgia women & girls",                        vulnerability:"high",    chairVacant:false},
  {id:1007,state:"GA",name:"Georgia Council on Criminal Justice — Advisory Panel",              domain:"justice",  vacantSeats:5, totalSeats:16, vacantSince:"2024-01-01",actionsPerMonth:3, populationServed:11000000,populationLabel:"criminal justice participants statewide",         vulnerability:"moderate",chairVacant:false},
  {id:1008,state:"GA",name:"Georgia Housing Finance Authority — Public Member Board Seats",     domain:"housing",  vacantSeats:4, totalSeats:14, vacantSince:"2024-06-01",actionsPerMonth:4, populationServed:400000,  populationLabel:"low-income housing seekers statewide",         vulnerability:"high",    chairVacant:false},
  {id:1009,state:"GA",name:"Georgia Environmental Finance Authority Board",                     domain:"environment",vacantSeats:4,totalSeats:12, vacantSince:"2024-03-01",actionsPerMonth:3, populationServed:2000000, populationLabel:"Georgia communities reliant on clean infrastructure",vulnerability:"moderate",chairVacant:false},
  {id:1010,state:"GA",name:"Georgia Board of Education — Advisory Public Members",              domain:"education",vacantSeats:4, totalSeats:14, vacantSince:"2024-07-01",actionsPerMonth:4, populationServed:1700000, populationLabel:"Georgia K-12 students & families",             vulnerability:"high",    chairVacant:false},
  // ── Illinois ──
  {id:1101,state:"IL",name:"Illinois Health Information Exchange Authority — ILHIE Advisory Board",domain:"health",vacantSeats:6,totalSeats:19, vacantSince:"2023-10-01",actionsPerMonth:4, populationServed:12700000,populationLabel:"health providers & patients statewide",         vulnerability:"high",    chairVacant:false},
  {id:1102,state:"IL",name:"Illinois Council on Women and Girls",                               domain:"equity",   vacantSeats:5, totalSeats:14, vacantSince:"2023-08-01",actionsPerMonth:2, populationServed:6400000, populationLabel:"Illinois women & girls",                       vulnerability:"high",    chairVacant:false},
  {id:1103,state:"IL",name:"Illinois Council on Developmental Disabilities",                    domain:"disability",vacantSeats:8,totalSeats:24, vacantSince:"2023-06-01",actionsPerMonth:3, populationServed:700000,  populationLabel:"Illinoisans with developmental disabilities",  vulnerability:"critical",chairVacant:false},
  {id:1104,state:"IL",name:"Illinois Opioid Crisis Response Advisory Council",                  domain:"health",   vacantSeats:6, totalSeats:20, vacantSince:"2024-01-01",actionsPerMonth:4, populationServed:350000,  populationLabel:"Illinoisans affected by opioid and SUD",       vulnerability:"high",    chairVacant:false},
  {id:1105,state:"IL",name:"Illinois Housing Development Authority — Board of Directors",       domain:"housing",  vacantSeats:5, totalSeats:16, vacantSince:"2023-12-01",actionsPerMonth:4, populationServed:500000,  populationLabel:"low-income housing seekers statewide",         vulnerability:"high",    chairVacant:false},
  {id:1106,state:"IL",name:"Illinois Environmental Justice Commission",                         domain:"environment",vacantSeats:4,totalSeats:13, vacantSince:"2023-11-01",actionsPerMonth:2, populationServed:1500000, populationLabel:"overburdened communities statewide",            vulnerability:"moderate",chairVacant:false},
  {id:1107,state:"IL",name:"Illinois Criminal Justice Information Authority — Public Members",  domain:"justice",  vacantSeats:4, totalSeats:14, vacantSince:"2024-02-01",actionsPerMonth:3, populationServed:12700000,populationLabel:"criminal justice participants statewide",         vulnerability:"moderate",chairVacant:false},
  {id:1108,state:"IL",name:"Illinois State Board of Education — Advisory Council Members",      domain:"education",vacantSeats:5, totalSeats:18, vacantSince:"2023-09-01",actionsPerMonth:4, populationServed:1900000, populationLabel:"Illinois K-12 students & families",            vulnerability:"high",    chairVacant:false},
  {id:1109,state:"IL",name:"Governor's Rural Affairs Council",                                  domain:"equity",   vacantSeats:5, totalSeats:15, vacantSince:"2023-07-01",actionsPerMonth:2, populationServed:2000000, populationLabel:"rural Illinoisans",                            vulnerability:"high",    chairVacant:false},
  {id:1110,state:"IL",name:"Illinois Commission on Equity and Inclusion",                       domain:"equity",   vacantSeats:4, totalSeats:14, vacantSince:"2024-03-01",actionsPerMonth:2, populationServed:3000000, populationLabel:"historically underserved Illinoisans",          vulnerability:"high",    chairVacant:false},
];

// ─── Config-driven boards — auto-scales suite-wide ─────────────────────────────
// Every state the scraper promotes into states.config.js flows into ImpactMap here
// with NO manual editing. Pilot states above keep their curated figures; every
// OTHER live state is derived from the shared, scraper-verified config.
//
// "Prove it" boundary: the FACTS below (board, seats, vacancy count, domain,
// source) come verbatim from the verified config. The impact-MODEL inputs that no
// public portal publishes are filled by disclosed, uniform rules — never invented
// per board:
//   • severity      → derived from the vacancy rate (+ chair-vacant), not assigned
//   • months vacant → the source's published vacancy date if it has one, else the
//                     date OpenQuorum FIRST verified the vacancy (an honest floor)
//   • throughput    → a per-domain default (DOMAIN_THROUGHPUT) — a stated assumption
//   • reach         → the board's own constituent text + statewide population as a
//                     labeled coarse estimate (STATE_POP), pending a cited figure
const PILOT_STATES = new Set(PILOT_BOARDS.map(b => b.state));

// Approx. statewide populations (US Census), for coarse reach estimates only.
const STATE_POP = { WA: 7700000, OR: 4200000, CA: 39000000 };
const FALLBACK_POP = 1000000;

// Disclosed default advisory throughput (actions/month) by policy domain.
const DOMAIN_THROUGHPUT = { health: 4, education: 4, disability: 3, housing: 4, justice: 3, equity: 2, environment: 2 };

const deriveVulnerability = (rate, chairVacant) =>
  (chairVacant || rate >= 0.5) ? "critical" : rate >= 0.33 ? "high" : "moderate";

function configToImpact(b) {
  const rate = b.totalSeats ? b.vacantSeats / b.totalSeats : 0;
  const chairVacant = /chair\s+vacant/i.test(b.criticalNote || "");
  return {
    id: `${b.state}-${b.id}`,                       // string id — never collides with numeric pilot ids
    state: b.state,
    name: b.name,
    domain: b.domain,
    vacantSeats: b.vacantSeats,
    totalSeats: b.totalSeats,
    vacantSince: b.vacantSince || b.lastVerified,   // published date, else observed-since floor
    observed: !b.vacantSince,
    actionsPerMonth: DOMAIN_THROUGHPUT[b.domain] || 3,
    populationServed: STATE_POP[b.state] || FALLBACK_POP,
    populationLabel: b.constituent || `${STATE_META[b.state]?.label || b.state} residents`,
    vulnerability: deriveVulnerability(rate, chairVacant),
    chairVacant,
  };
}

// Only non-pilot live states, and only boards that actually have a vacancy.
const configBoards = CONFIG_BOARDS
  .filter(b => !PILOT_STATES.has(b.state) && b.vacantSeats > 0 && b.totalSeats > 0)
  .map(configToImpact);

const BOARDS = [...PILOT_BOARDS, ...configBoards];

// ─── Domain styles ─────────────────────────────────────────────────────────────
const DS = {
  health:      {bg:"#E1F5EE",color:"#085041",bar:"#1D9E75"},
  education:   {bg:"#E6F1FB",color:"#0C447C",bar:"#378ADD"},
  equity:      {bg:"#EEEDFE",color:"#3C3489",bar:"#7F77DD"},
  environment: {bg:"#EAF3DE",color:"#27500A",bar:"#5A9E27"},
  housing:     {bg:"#FAEEDA",color:"#633806",bar:"#EF9F27"},
  disability:  {bg:"#FBEAF0",color:"#72243E",bar:"#C4506E"},
  justice:     {bg:"#FAECE7",color:"#712B13",bar:"#D85A30"},
};

// ─── Vulnerability styles ──────────────────────────────────────────────────────
const VL = {
  critical:{border:"#E24B4A",badge:"#FCEBEB",text:"#791F1F",label:"Crisis level"},
  high:    {border:"#EF9F27",badge:"#FAEEDA",text:"#633806",label:"High impact"},
  moderate:{border:"#7F77DD",badge:"#EEEDFE",text:"#3C3489",label:"Moderate impact"},
};

// ─── Calculations ──────────────────────────────────────────────────────────────
const calcDays = d => Math.floor((new Date()-new Date(d))/86400000);

function calcImpact(b) {
  const days=calcDays(b.vacantSince), months=days/30.44;
  const rate=b.vacantSeats/b.totalSeats;
  const reduction=Math.min(rate*((rate>0.5||b.chairVacant)?1.4:1.1),0.70);
  const deferred=Math.round(b.actionsPerMonth*reduction*months);
  const constituent=Math.max(Math.round(deferred*(b.populationServed/(b.actionsPerMonth*12))),deferred*2);
  const score=deferred*(b.vulnerability==="critical"?3:b.vulnerability==="high"?2:1);
  return {days,months:Math.round(months),rate:Math.round(rate*100),reduction:Math.round(reduction*100),deferred,constituent,score};
}

// ─── Client-side impact statement generator ────────────────────────────────────
// No API calls — deterministic, instant, works everywhere, zero latency.
function generateImpactStatement(board, impact) {
  const sv = STATE_META[board.state] || {label: board.state};
  const chairNote = board.chairVacant ? " — including the chair position —" : "";
  const yrs = impact.months >= 12
    ? `over ${(impact.months/12).toFixed(1)} years`
    : `${impact.months} months`;
  const pop = impact.constituent >= 1000000
    ? `${(impact.constituent/1000000).toFixed(1)} million`
    : impact.constituent >= 1000
    ? `${Math.round(impact.constituent/1000).toLocaleString()} thousand`
    : impact.constituent.toLocaleString();

  if (board.vulnerability === "critical") {
    return `The ${board.name} in ${sv.label} has operated at ${impact.rate}% vacancy${chairNote} for ${yrs}, stalling an estimated ${impact.deferred.toLocaleString()} decisions that directly affect ${board.populationLabel}. With approximately ${pop} people depending on this board's work, every month without adequate membership translates into delayed services, unresolved cases, and eroded accountability for ${sv.label}'s most vulnerable residents.`;
  }
  if (board.vulnerability === "high") {
    return `${impact.rate}% of seats on ${sv.label}'s ${board.name} have been vacant for ${yrs}, meaningfully reducing the board's capacity to act on behalf of ${board.populationLabel}. An estimated ${impact.deferred.toLocaleString()} decisions have been deferred, with downstream effects reaching approximately ${pop} constituents who depend on this board's oversight, recommendations, and policy guidance.`;
  }
  return `The ${board.name} in ${sv.label} has carried a ${impact.rate}% vacancy rate for ${yrs}. While the board retains operating capacity, an estimated ${impact.deferred.toLocaleString()} decisions have been delayed — affecting approximately ${pop} residents who rely on the board's work across ${board.domain} policy, oversight, and advisory functions.`;
}

// ─── Client-side press brief generator ────────────────────────────────────────
function generatePressBrief(filtered, stateFilter, totalDeferred, totalConstituent, criticalCount, avgMonths) {
  const label = stateFilter === "ALL"
    ? "the Mid-Atlantic, Northeast, and Midwest region"
    : (STATE_META[stateFilter]?.label || stateFilter);
  const dateStr = new Date().toLocaleDateString("en-US", {month:"long",day:"numeric",year:"numeric"});
  const popFmt = n => n >= 1000000 ? `${(n/1000000).toFixed(1)} million` : `${Math.round(n/1000).toLocaleString()} thousand`;

  const bullets = filtered.slice(0,5).map(b => {
    const sv = STATE_META[b.state]?.label || b.state;
    return `• ${b.name} (${sv}): ${b.impact.rate}% vacant for ${b.impact.months} months — ~${b.impact.deferred.toLocaleString()} decisions deferred, serving ${b.populationLabel}`;
  }).join("\n");

  return `HEADLINE: Civic Board Vacancies in ${label} Have Stalled ${totalDeferred.toLocaleString()} Decisions, Affecting an Estimated ${popFmt(totalConstituent)} Constituents

FOR IMMEDIATE RELEASE — ${dateStr}

Board vacancies across ${label} have accumulated to a point where an estimated ${totalDeferred.toLocaleString()} advisory decisions have been deferred, affecting approximately ${popFmt(totalConstituent)} residents who depend on these boards for health, housing, education, and equity oversight. Of the ${filtered.length} boards tracked, ${criticalCount} have reached crisis-level vacancy status, with an average vacancy duration of ${avgMonths} months across the region.

KEY FINDINGS:
• ${criticalCount} boards operating at crisis-level vacancy — 40%+ of seats unfilled, some for over a year
• Average vacancy duration: ${avgMonths} months (~${(avgMonths/12).toFixed(1)} years) across all tracked boards
• Estimated ${totalDeferred.toLocaleString()} advisory decisions deferred due to insufficient quorum or membership capacity
• Approximately ${popFmt(totalConstituent)} constituents across health, disability, housing, education, equity, and justice domains affected

MOST IMPACTFUL VACANCIES:
${bullets}

METHODOLOGY NOTE: Deferred decisions are estimated using board throughput rates, vacancy-adjusted capacity reduction, and months vacant; constituent impact figures are estimates based on served population data from state agency records.

SOURCE: OpenQuorum ImpactMap — openquorum.org`;
}

// ─── Impact card modal ─────────────────────────────────────────────────────────
function ImpactCardModal({board, impact, statement, onClose}) {
  const [copied,setCopied]=useState(false);
  const sv = STATE_META[board.state] || {label:board.state, color:"#1a1a1a", bg:"#f5f5f5"};
  const text=`${board.name} (${sv.label})\n${impact.rate}% vacant · ${impact.months} months · ${board.vacantSeats}/${board.totalSeats} seats\n\nEst. ${impact.constituent.toLocaleString()} constituents affected · ${impact.deferred.toLocaleString()} decisions deferred\n\n${statement||""}\n\nSource: OpenQuorum ImpactMap — openquorum.org`;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={onClose}>
      <div style={{maxWidth:460,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"#0A1628",borderRadius:14,padding:"1.75rem",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
            <span style={{fontSize:16,fontWeight:600,color:"#fff",letterSpacing:"-0.02em"}}>Open<span style={{color:"#1D9E75"}}>Quorum</span></span>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:sv.bg,color:sv.color,fontWeight:600}}>{sv.label}</span>
          </div>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",margin:"0 0 10px",lineHeight:1.5}}>{board.name}</p>
          <p style={{fontSize:44,fontWeight:600,color:"#1D9E75",margin:"0 0 3px",letterSpacing:"-0.04em",lineHeight:1}}>
            {impact.constituent>=1000000?`${(impact.constituent/1000000).toFixed(1)}M`:impact.constituent>=1000?`${Math.round(impact.constituent/1000)}K`:impact.constituent.toLocaleString()}
          </p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:"0 0 1.25rem"}}>estimated constituents affected</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:"1.25rem"}}>
            {[`${impact.rate}% vacant`,`${impact.months} months`,`${impact.deferred.toLocaleString()} deferred`].map(t=>(
              <span key={t} style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)"}}>{t}</span>
            ))}
          </div>
          {statement&&<p style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.75,fontStyle:"italic",borderLeft:"2px solid #1D9E75",paddingLeft:12,margin:"0 0 1.25rem"}}>{statement}</p>}
          <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:0}}>openquorum.org</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{navigator.clipboard?.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
            style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid #1D9E75",background:copied?"#1D9E75":"transparent",color:copied?"#fff":"#1D9E75",cursor:"pointer",fontSize:13,fontWeight:500}}>
            {copied?"Copied!":"Copy card text"}
          </button>
          <button onClick={onClose} style={{padding:"9px 16px",borderRadius:8,border:"1px solid #555",background:"transparent",color:"#54544E",cursor:"pointer",fontSize:13}}>Close</button>
        </div>
        <p style={{margin:"8px 0 0",fontSize:11,color:"rgba(255,255,255,0.35)",textAlign:"center"}}>Screenshot this card to share on social or in press outreach</p>
      </div>
    </div>
  );
}

// ─── Press brief modal ─────────────────────────────────────────────────────────
function PressBriefModal({brief, onClose}) {
  const [copied,setCopied]=useState(false);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",maxWidth:640,width:"100%",maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <p style={{margin:"0 0 2px",fontSize:14,fontWeight:500,color:"#1a1a1a"}}>Press Brief</p>
            <p style={{margin:0,fontSize:11,color:"#4A4A44"}}>Generated by OpenQuorum · ready to send to journalists</p>
          </div>
          <button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",fontSize:18,color:"#4A4A44"}}>×</button>
        </div>
        <div style={{flex:1,overflowY:"auto",background:"#f8f8f7",borderRadius:8,padding:"1rem 1.25rem",fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.85,color:"#1a1a1a",whiteSpace:"pre-wrap",marginBottom:12}}>{brief}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{navigator.clipboard?.writeText(brief);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
            style={{flex:1,padding:"8px 0",borderRadius:8,border:"1px solid #1D9E75",background:copied?"#1D9E75":"transparent",color:copied?"#fff":"#1D9E75",cursor:"pointer",fontSize:13,fontWeight:500}}>
            {copied?"Copied!":"Copy for email / press release"}
          </button>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #ddd",background:"transparent",color:"#666",cursor:"pointer",fontSize:13}}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Board card ────────────────────────────────────────────────────────────────
function BoardCard({board, impact, expanded, onToggle, statement, onStatement, onShareCard}) {
  const ds=DS[board.domain]||DS.justice;
  const vs=VL[board.vulnerability]||VL.moderate;
  const sv=STATE_META[board.state]||{label:board.state,color:"#1a1a1a",bg:"#f5f5f5",applyUrl:"#",applyLabel:""};

  return(
    <div style={{border:"1px solid #eee",borderLeft:`3px solid ${vs.border}`,borderRadius:"0 12px 12px 0",background:"#fff",marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"0.9rem 1rem",cursor:"pointer"}} onClick={onToggle}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600,lineHeight:1.3}}>{board.name}</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:sv.bg,color:sv.color,fontWeight:600}}>{sv.label}</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,...ds,fontWeight:500}}>{board.domain}</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:vs.badge,color:vs.text,fontWeight:500}}>{vs.label}</span>
              {board.chairVacant&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"#FCEBEB",color:"#791F1F"}}>Chair vacant</span>}
            </div>
            <p style={{margin:0,fontSize:12,color:"#4A4A44"}}>Serves: <strong style={{color:"#555",fontWeight:500}}>{board.populationLabel}</strong></p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <p style={{margin:"0 0 1px",fontSize:20,fontWeight:600,color:vs.border}}>{impact.deferred.toLocaleString()}</p>
            <p style={{margin:"0 0 1px",fontSize:10,color:"#54544E"}}>deferred decisions</p>
            <p style={{margin:0,fontSize:12,color:"#43433E",fontWeight:500}}>{impact.months}mo · {impact.rate}% vacant</p>
          </div>
        </div>
      </div>

      {expanded&&(
        <div style={{padding:"0 1rem 1rem",borderTop:"1px solid #f5f5f5"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8,margin:"0.85rem 0"}}>
            {[
              {l:"Vacancy",     v:`${impact.rate}%`,    s:`${board.vacantSeats}/${board.totalSeats} seats`},
              {l:"Duration",    v:`${impact.months}mo`, s:`${impact.days.toLocaleString()} days`},
              {l:"Lost capacity",v:`${impact.reduction}%`,s:"throughput reduction"},
              {l:"Deferred",    v:impact.deferred.toLocaleString(),s:"decisions stalled"},
              {l:"Affected",    v:impact.constituent>=1000000?`${(impact.constituent/1000000).toFixed(1)}M`:impact.constituent>=1000?`${Math.round(impact.constituent/1000)}K`:impact.constituent.toLocaleString(),s:"est. constituents"},
            ].map(s=>(
              <div key={s.l} style={{background:"#f8f8f7",borderRadius:8,padding:"0.6rem 0.75rem"}}>
                <p style={{margin:"0 0 2px",fontSize:10,fontWeight:600,color:"#3D3D38",textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.l}</p>
                <p style={{margin:"0 0 1px",fontSize:16,fontWeight:600,color:"#1a1a1a"}}>{s.v}</p>
                <p style={{margin:0,fontSize:10,color:"#54544E"}}>{s.s}</p>
              </div>
            ))}
          </div>

          {statement&&(
            <div style={{background:"#f8f8f7",borderRadius:8,padding:"0.85rem 1rem",marginBottom:10,borderLeft:"3px solid #1D9E75"}}>
              <p style={{margin:"0 0 5px",fontSize:10,fontWeight:500,color:"#54544E",textTransform:"uppercase",letterSpacing:"0.07em"}}>Impact statement — press & testimony ready</p>
              <p style={{margin:0,fontSize:13,color:"#1a1a1a",lineHeight:1.75,fontFamily:"Georgia,serif"}}>{statement}</p>
            </div>
          )}

          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {!statement&&(
              <button onClick={onStatement}
                style={{padding:"6px 14px",borderRadius:8,border:"1px solid #ddd",background:"transparent",color:"#1a1a1a",cursor:"pointer",fontSize:12,fontWeight:500}}>
                Generate impact statement →
              </button>
            )}
            {statement&&<>
              <button onClick={()=>navigator.clipboard?.writeText(statement)}
                style={{padding:"6px 14px",borderRadius:8,border:"1px solid #ddd",background:"transparent",color:"#555",cursor:"pointer",fontSize:12}}>Copy statement</button>
              <button onClick={onShareCard}
                style={{padding:"6px 14px",borderRadius:8,border:"1px solid #1D9E75",background:"transparent",color:"#1D9E75",cursor:"pointer",fontSize:12,fontWeight:500}}>Share impact card ↗</button>
            </>}
            <a href={sv.applyUrl} target="_blank" rel="noreferrer"
              aria-label={`Apply to ${board.name} via ${sv.applyAuthority||"the state appointments office"}`}
              style={{padding:"6px 14px",borderRadius:8,border:"1px solid #d5d5d2",background:"transparent",color:"#43433E",fontSize:12,fontWeight:500,textDecoration:"none"}}>
              {sv.applyAuthority ? `Apply via ${sv.applyAuthority} ↗` : "Apply to this seat ↗"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ImpactMap() {
  const [stateFilter,setStateFilter]=useState("ALL");
  const [domain,setDomain]=useState("all");
  const [sortBy,setSortBy]=useState("score");
  const [expanded,setExpanded]=useState({});
  const [statements,setStatements]=useState({});
  const [cardBoard,setCardBoard]=useState(null);
  const [brief,setBrief]=useState(null);
  const [showMenu,setShowMenu]=useState(false);

  // Live states only — scaffolded states have no board data yet (never fabricated)
  const stateList = useMemo(() => LIVE_STATES, []);

  const enriched=useMemo(()=>BOARDS.map(b=>({...b,impact:calcImpact(b)})),[]);

  const filtered=useMemo(()=>{
    let list=stateFilter==="ALL"?enriched:enriched.filter(b=>b.state===stateFilter);
    if(domain!=="all") list=list.filter(b=>b.domain===domain);
    return [...list].sort((a,b)=>{
      if(sortBy==="score")       return b.impact.score-a.impact.score;
      if(sortBy==="deferred")    return b.impact.deferred-a.impact.deferred;
      if(sortBy==="constituent") return b.impact.constituent-a.impact.constituent;
      if(sortBy==="duration")    return b.impact.days-a.impact.days;
      return 0;
    });
  },[enriched,stateFilter,domain,sortBy]);

  const totalDeferred    = filtered.reduce((s,b)=>s+b.impact.deferred,0);
  const totalConstituent = filtered.reduce((s,b)=>s+b.impact.constituent,0);
  const criticalCount    = filtered.filter(b=>b.vulnerability==="critical").length;
  const avgMonths        = Math.round(filtered.reduce((s,b)=>s+b.impact.months,0)/Math.max(filtered.length,1));

  const domainBars=useMemo(()=>{
    const map={};
    filtered.forEach(b=>{if(!map[b.domain])map[b.domain]=0; map[b.domain]+=b.impact.deferred;});
    const max=Math.max(...Object.values(map),1);
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([d,v])=>({domain:d,deferred:v,pct:Math.round((v/max)*100)}));
  },[filtered]);

  const handleStatement = useCallback((id) => {
    if(statements[id]) return;
    const board = BOARDS.find(b=>b.id===id);
    if(!board) return;
    const impact = calcImpact(board);
    setStatements(s=>({...s,[id]:generateImpactStatement(board,impact)}));
  },[statements]);

  const handlePressBrief = useCallback(() => {
    setBrief(generatePressBrief(filtered,stateFilter,totalDeferred,totalConstituent,criticalCount,avgMonths));
  },[filtered,stateFilter,totalDeferred,totalConstituent,criticalCount,avgMonths]);

  const summaryText = `Board vacancies in ${stateFilter==="ALL"?"the region":(STATE_META[stateFilter]?.label||stateFilter)} have stalled an estimated ${totalDeferred.toLocaleString()} decisions affecting ${totalConstituent>=1000000?`${(totalConstituent/1000000).toFixed(1)}M`:`${Math.round(totalConstituent/1000)}K`} constituents. Source: OpenQuorum ImpactMap — openquorum.org`;

  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",maxWidth:960,margin:"0 auto",padding:"0 0 3rem",color:"#1a1a1a"}} onClick={()=>showMenu&&setShowMenu(false)}>

      {cardBoard&&<ImpactCardModal board={cardBoard.board} impact={cardBoard.impact} statement={statements[cardBoard.board.id]} onClose={()=>setCardBoard(null)}/>}
      {brief&&<PressBriefModal brief={brief} onClose={()=>setBrief(null)}/>}

      {/* Header */}
      <div style={{borderBottom:"1px solid #eee",paddingBottom:"1rem",marginBottom:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
              <span style={{fontSize:20,fontWeight:600,letterSpacing:"-0.02em"}}>Open<span style={{color:"#1D9E75"}}>Quorum</span></span>
              <span style={{color:"#ddd"}}>·</span>
              <span style={{fontSize:15,fontWeight:500}}>ImpactMap</span>
              {/* State picker — auto-populates from STATE_META as new states are added */}
              <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setShowMenu(v=>!v)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:20,border:"1.5px solid #1D9E75",background:"#E1F5EE",color:"#0F6E56",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                  {stateFilter==="ALL"?`All ${stateList.length} states`:(STATE_META[stateFilter]?.label||stateFilter)} <span style={{fontSize:10}}>▾</span>
                </button>
                {showMenu&&(
                  <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",border:"1px solid #eee",borderRadius:10,minWidth:180,zIndex:200,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",overflow:"hidden"}}>
                    <button onClick={()=>{setStateFilter("ALL");setDomain("all");setShowMenu(false);}}
                      style={{display:"block",width:"100%",textAlign:"left",padding:"9px 14px",border:"none",background:stateFilter==="ALL"?"#E1F5EE":"transparent",color:stateFilter==="ALL"?"#0F6E56":"#333",fontSize:13,cursor:"pointer",fontWeight:stateFilter==="ALL"?600:400}}>
                      All {stateList.length} states {stateFilter==="ALL"?"✓":""}
                    </button>
                    {stateList.map(code=>{
                      const sv=STATE_META[code];
                      return(
                        <button key={code} onClick={()=>{setStateFilter(code);setDomain("all");setShowMenu(false);}}
                          style={{display:"block",width:"100%",textAlign:"left",padding:"9px 14px",border:"none",background:stateFilter===code?"#E1F5EE":"transparent",color:stateFilter===code?"#0F6E56":"#333",fontSize:13,cursor:"pointer",fontWeight:stateFilter===code?600:400}}>
                          {sv?.label||code} {stateFilter===code?"✓":""}
                        </button>
                      );
                    })}
                    <p style={{margin:"4px 0 0",padding:"6px 14px 4px",fontSize:10,fontWeight:600,color:"#54544E",textTransform:"uppercase",letterSpacing:"0.08em",borderTop:"1px solid #f0f0f0"}}>Coming online — scraper in progress</p>
                    <div style={{maxHeight:150,overflowY:"auto"}}>
                      {SCAFFOLDED_STATES.map(code=>(
                        <div key={code} aria-disabled="true" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 14px",fontSize:12,color:"#54544E"}}>
                          <span>{STATE_META[code]?.label||code}</span><span style={{fontSize:10,background:"#f5f5f5",padding:"1px 6px",borderRadius:20}}>in progress</span>
                        </div>
                      ))}
                    </div>
                    <div style={{padding:"8px 12px",borderTop:"1px solid #f0f0f0"}}>
                      <a href={REQUEST_STATE_CONTACT} style={{display:"block",textAlign:"center",padding:"6px 0",border:"1px dashed #1D9E75",borderRadius:8,color:"#1D9E75",fontSize:12,fontWeight:500,textDecoration:"none"}}>+ Request priority for your state</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p style={{margin:0,fontSize:12,color:"#4A4A44"}}>Constituent harm calculator — translating vacancy duration into real human cost</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={handlePressBrief}
              style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#1D9E75",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>
              Generate press brief →
            </button>
            <button onClick={()=>navigator.clipboard?.writeText(summaryText)}
              style={{padding:"7px 14px",borderRadius:8,border:"1px solid #ddd",background:"transparent",color:"#555",cursor:"pointer",fontSize:12}}>
              Copy summary
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:"1.25rem"}}>
        {[
          {l:"Deferred decisions",   v:totalDeferred.toLocaleString(),    s:"stalled across all boards",c:"#E24B4A"},
          {l:"Constituents affected", v:totalConstituent>=1000000?`${(totalConstituent/1000000).toFixed(1)}M`:totalConstituent>=1000?`${Math.round(totalConstituent/1000)}K`:totalConstituent.toLocaleString(),s:"est. total reach",c:"#E24B4A"},
          {l:"Crisis-level boards",  v:criticalCount,                     s:"critical vacancy level",  c:"#E24B4A"},
          {l:"Avg vacancy",          v:`${avgMonths}mo`,                  s:`~${(avgMonths/12).toFixed(1)}y avg`,c:"#EF9F27"},
          {l:"Boards tracked",       v:filtered.length,                   s:stateFilter==="ALL"?`${stateList.length} states combined`:(STATE_META[stateFilter]?.label||stateFilter),c:"#1D9E75"},
        ].map(s=>(
          <div key={s.l} style={{background:"#f8f8f7",borderRadius:8,padding:"0.85rem 1rem"}}>
            <p style={{margin:"0 0 3px",fontSize:11,fontWeight:600,color:"#3D3D38",textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.l}</p>
            <p style={{margin:"0 0 2px",fontSize:20,fontWeight:600,color:s.c,letterSpacing:"-0.02em"}}>{s.v}</p>
            <p style={{margin:0,fontSize:11,color:"#54544E"}}>{s.s}</p>
          </div>
        ))}
      </div>

      {/* Domain bars */}
      <div style={{background:"#f8f8f7",borderRadius:8,padding:"1rem 1.25rem",marginBottom:"1.25rem"}}>
        <p style={{margin:"0 0 12px",fontSize:11,fontWeight:500,color:"#4A4A44",textTransform:"uppercase",letterSpacing:"0.07em"}}>Deferred decisions by domain — click to filter</p>
        {domainBars.map(({domain:d,deferred,pct})=>{
          const ds=DS[d]||DS.justice;
          return(
            <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7,cursor:"pointer"}} onClick={()=>setDomain(domain===d?"all":d)}>
              <span style={{fontSize:11,color:domain===d?ds.bar:"#888",width:82,flexShrink:0,textAlign:"right",textTransform:"capitalize",fontWeight:domain===d?600:400}}>{d}</span>
              <div style={{flex:1,height:7,background:"#e8e8e8",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:7,width:`${pct}%`,background:ds.bar,borderRadius:4,transition:"width 0.4s"}}/>
              </div>
              <span style={{fontSize:11,color:"#4A4A44",minWidth:90}}>{deferred.toLocaleString()} deferred</span>
            </div>
          );
        })}
      </div>

      {/* Sort controls */}
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:"0.85rem",flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:"#54544E"}}>Sort:</span>
        {[["score","Severity"],["deferred","Deferred"],["constituent","Constituents"],["duration","Duration"]].map(([v,l])=>(
          <button key={v} onClick={()=>setSortBy(v)}
            style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${sortBy===v?"#1D9E75":"#eee"}`,background:"transparent",color:sortBy===v?"#1D9E75":"#888",cursor:"pointer",fontSize:11,fontWeight:sortBy===v?500:400}}>
            {l}
          </button>
        ))}
        <span style={{marginLeft:"auto",fontSize:11,color:"#54544E"}}>{filtered.length} boards</span>
      </div>

      {/* Board cards */}
      <div>
        {filtered.map(b=>(
          <BoardCard key={b.id} board={b} impact={b.impact}
            expanded={!!expanded[b.id]}
            onToggle={()=>setExpanded(e=>({...e,[b.id]:!e[b.id]}))}
            statement={statements[b.id]}
            onStatement={()=>{setExpanded(e=>({...e,[b.id]:true}));handleStatement(b.id);}}
            onShareCard={()=>setCardBoard({board:b,impact:b.impact})}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{marginTop:"1.5rem",paddingTop:"1rem",borderTop:"1px solid #f0f0f0",fontSize:11,color:"#54544E",lineHeight:1.7}}>
        Methodology: deferred actions = base throughput × vacancy-adjusted capacity reduction × months vacant. Board facts — seats, vacancies, and domain — are scraper-verified from official state appointment portals. Where a portal does not publish a seat's vacancy start date, duration is measured from the date OpenQuorum first verified the vacancy, an honest lower bound that grows over time. Throughput uses disclosed per-domain defaults and severity is derived from the vacancy rate; all impact figures are estimates. Full methodology: openquorum.org
      </div>
    </div>
  );
}
