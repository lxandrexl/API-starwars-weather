Feature: Listar historial de consultas fusionadas

  Scenario: Listado con elementos y nextKey
    Given existen 2 elementos en el historial con nextKey
    When hago GET "/starwars/historial?limit=2"
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "ok"
    And el detalle incluye 2 elementos
    And el detalle incluye next keys

  Scenario: Listado vacío
    Given el historial está vacío
    When hago GET "/starwars/historial"
    Then la respuesta tiene statusCode 200
    And el cuerpo contiene status "ok"
    And el detalle no tiene next keys
