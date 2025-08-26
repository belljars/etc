# Koko ohjelma laskee liikkuvat päivät Suomessa, kuten pääsiäinen, juhannus ja muut tärkeät juhlapäivät

import datetime

def laske_paasiainen(year):
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    return datetime.date(year, month, day)

def laske_pitkaperjantai(year):
    paasiainen = laske_paasiainen(year)
    return paasiainen - datetime.timedelta(days=2)

def laske_toinen_paasiainen(year):
    paasiainen = laske_paasiainen(year)
    return paasiainen + datetime.timedelta(days=1)

def laske_helatorstai(year):
    paasiainen = laske_paasiainen(year)
    return paasiainen + datetime.timedelta(days=39)

def laske_helluntaipaiva(year):
    paasiainen = laske_paasiainen(year)
    return paasiainen + datetime.timedelta(days=49)

def laske_juhannuspaiva(year):
    paiva = datetime.date(year, 6, 20)
    while paiva.weekday() != 5:
        paiva += datetime.timedelta(days=1)
    return paiva

def laske_pyhainpaiva(year):
    paiva = datetime.date(year, 10, 31)
    while paiva.weekday() != 5 or paiva > datetime.date(year, 11, 6):
        paiva += datetime.timedelta(days=1)
        if paiva > datetime.date(year, 11, 6):
            break
    return paiva

def laske_aitienpaiva(year):
    paiva = datetime.date(year, 5, 1)
    while paiva.weekday() != 6:
        paiva += datetime.timedelta(days=1)
    return paiva + datetime.timedelta(days=7)

def laske_kaatuneiden_muistopaiva(year):
    paiva = datetime.date(year, 5, 1)
    while paiva.weekday() != 6:
        paiva += datetime.timedelta(days=1)
    return paiva + datetime.timedelta(days=14)

def laske_isanpaiva(year):
    paiva = datetime.date(year, 11, 1)
    while paiva.weekday() != 6:
        paiva += datetime.timedelta(days=1)
    return paiva + datetime.timedelta(days=7)

