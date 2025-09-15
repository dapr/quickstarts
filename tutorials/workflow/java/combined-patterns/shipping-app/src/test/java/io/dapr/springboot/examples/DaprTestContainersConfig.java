/*
 * Copyright 2025 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
limitations under the License.
*/

package io.dapr.springboot.examples;

import com.redis.testcontainers.RedisContainer;
import io.dapr.testcontainers.Component;
import io.dapr.testcontainers.DaprContainer;
import io.dapr.testcontainers.DaprLogLevel;
import io.dapr.testcontainers.Subscription;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.Network;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.dapr.springboot.examples.ShippingAppRestController.DAPR_PUBSUB_COMPONENT;
import static io.dapr.springboot.examples.ShippingAppRestController.DAPR_PUBSUB_REGISTRATION_TOPIC;
import static io.dapr.testcontainers.DaprContainerConstants.DAPR_RUNTIME_IMAGE_TAG;

@TestConfiguration(proxyBeanMethods = false)
public class DaprTestContainersConfig {


  @Bean
  public RedisContainer redisContainer(Network daprNetwork, Environment env){
    boolean reuse = env.getProperty("reuse", Boolean.class, false);
    return new RedisContainer(RedisContainer.DEFAULT_IMAGE_NAME)
            .withNetwork(daprNetwork)
            .withReuse(reuse)
            .withNetworkAliases("redis");
  }

  @Bean
  @ServiceConnection
  public DaprContainer daprContainer(Network daprNetwork, RedisContainer redisContainer, Environment env) {
    boolean reuse = env.getProperty("reuse", Boolean.class, false);
    Map<String, String> redisProps = new HashMap<>();
    redisProps.put("redisHost", "redis:6379");
    redisProps.put("redisPassword", "");

    return new DaprContainer(DAPR_RUNTIME_IMAGE_TAG)
            .withAppName("shipping-app")
            .withComponent(new Component(DAPR_PUBSUB_COMPONENT, "pubsub.redis", "v1", redisProps))
            .withAppPort(8081)
            .withNetwork(daprNetwork)
            .withReuseScheduler(reuse)
            .withReusablePlacement(reuse)
            .withAppHealthCheckPath("/actuator/health")
            .withAppChannelAddress("host.testcontainers.internal")
//            .withDaprLogLevel(DaprLogLevel.DEBUG)
//            .withLogConsumer(outputFrame -> System.out.println(outputFrame.getUtf8String()))
            .dependsOn(redisContainer);
  }

  @Bean
  public Network getDaprNetwork(Environment env) {
    boolean reuse = env.getProperty("reuse", Boolean.class, false);
    if (reuse) {
      Network defaultDaprNetwork = new Network() {
        @Override
        public String getId() {
          return "dapr-network";
        }

        @Override
        public void close() {

        }

        @Override
        public Statement apply(Statement base, Description description) {
          return null;
        }
      };

      List<com.github.dockerjava.api.model.Network> networks = DockerClientFactory.instance().client().listNetworksCmd()
              .withNameFilter("dapr-network").exec();
      if (networks.isEmpty()) {
        Network.builder().createNetworkCmdModifier(cmd -> cmd.withName("dapr-network")).build().getId();
        return defaultDaprNetwork;
      } else {
        return defaultDaprNetwork;
      }
    } else {
      return Network.newNetwork();
    }
  }

}
