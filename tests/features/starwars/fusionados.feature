Feature: Consultar planeta fusionado con clima

  Scenario: Obtener datos de un planeta válido
    Given el planeta con id 1 existe en SWAPI
    And el clima para "Tatooine" está disponible
    When consulto GET /starwars/fusionados?planetId=1
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "ok"
    And el detalle incluye el nombre "Tatooine"
    And el detalle incluye información de clima

  Scenario: Error por planetId inválido
    When consulto GET /starwars/fusionados?planetId=0
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "bad_request"
    And el mensaje indica que planetId debe estar entre 1 y 60
