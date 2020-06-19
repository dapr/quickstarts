// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

using System;
using Microsoft.AspNetCore.Mvc;
using Subtract.Models;

namespace Subtract.Controllers
{
    [Route("v1.0/[controller]")]
    [ApiController]
    public class SubtractController : ControllerBase
    {

        //POST: /v1.0/subtract
        [HttpPost]
        public decimal Subtract(Operands operands)
        {
            Console.WriteLine($"Subtracting {operands.OperandTwo} from {operands.OperandOne}"); 
            return Decimal.Parse(operands.OperandOne) - Decimal.Parse(operands.OperandTwo);
        }
    }
}
