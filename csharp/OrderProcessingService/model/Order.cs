using System.ComponentModel.DataAnnotations;

namespace OrderProcessingService.model
{
    public class Order {
        public string orderName {get; set;}
        public int orderNum {get; set;}

        public Order(string orderName, int orderNum) {
            this.orderName = orderName;
            this.orderNum = orderNum;
        }
    }
}