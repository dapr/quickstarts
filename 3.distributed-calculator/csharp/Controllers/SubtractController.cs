// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

using System;
using Microsoft.AspNetCore.Mvc;
using Subtract.Models;

namespace Subtract.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SubtractController : ControllerBase
    {

        //POST: /subtract
        [HttpPost]
        public decimal Subtract(Operands operands)
        {
            return Decimal.Parse(operands.OperandOne) - Decimal.Parse(operands.OperandTwo);
        }
    }
}